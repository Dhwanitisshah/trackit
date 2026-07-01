'use client';

import { useState, useEffect, useRef } from 'react';
import { FileEdit, Copy, Check, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import type { Application, Profile } from '@/lib/types';

interface CoverLetterPanelProps {
  application: Application;
  profile: Profile | null;
  skills: string[];
}

export default function CoverLetterPanel({ application, profile, skills }: CoverLetterPanelProps) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function loadSaved() {
      const supabase = createClient();
      const { data } = await supabase
        .from('cover_letters')
        .select('body')
        .eq('application_id', application.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();
      if (data?.body) setBody(data.body);
    }
    loadSaved();
  }, [application.id]);

  // Debounced save on manual edit
  function handleBodyChange(value: string) {
    setBody(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      await supabase.from('cover_letters').upsert(
        { application_id: application.id, body: value, generated_at: new Date().toISOString() },
        { onConflict: 'application_id' }
      );
    }, 2000);
  }

  async function generate() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-application-id': application.id,
        },
        body: JSON.stringify({
          company: application.company,
          role: application.role,
          notes: application.notes,
          full_name: profile?.full_name,
          skills,
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBody(data.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileEdit className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cover letter</h2>
        </div>
        {body ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copy}>
              {copied ? <Check className="mr-1 h-3.5 w-3.5 text-green-500" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="secondary" size="sm" onClick={generate} disabled={loading}>
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="md" onClick={generate} disabled={loading}>
            {loading ? 'Writing your cover letter...' : 'Generate cover letter'}
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading && !body && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          Writing your cover letter...
        </div>
      )}

      {body && (
        <div className="mt-4">
          <textarea
            value={body}
            onChange={e => handleBodyChange(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          />
          <p className="mt-1 text-xs text-gray-400 text-right">{body.length} characters · auto-saves as you edit</p>
        </div>
      )}

      {!body && !loading && (
        <p className="mt-3 text-sm text-gray-500">
          Generate a personalised cover letter you can copy and customise.
        </p>
      )}
    </div>
  );
}
