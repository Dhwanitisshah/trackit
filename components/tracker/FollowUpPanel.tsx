'use client';

import { useState, useEffect } from 'react';
import { Mail, Copy, Check, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import type { Application } from '@/lib/types';

interface FollowUpPanelProps {
  application: Application;
  userFullName: string;
}

export default function FollowUpPanel({ application, userFullName }: FollowUpPanelProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSaved() {
      const supabase = createClient();
      const { data } = await supabase
        .from('follow_up_emails')
        .select('email_body')
        .eq('application_id', application.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();
      if (data?.email_body) setEmail(data.email_body);
    }
    loadSaved();
  }, [application.id]);

  async function generate() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/follow-up-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: application.company,
          role: application.role,
          applied_date: application.applied_date,
          notes: application.notes,
          full_name: userFullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEmail(data.email);

      const supabase = createClient();
      await supabase.from('follow_up_emails').insert({
        application_id: application.id,
        email_body: data.email,
        generated_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">Follow-up email</h2>
        </div>
        {email ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyEmail}>
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
            {loading ? 'Drafting your email...' : 'Generate draft'}
          </Button>
        )}
      </div>

      <p className="mt-1 text-xs text-gray-400">
        For {application.company} — {application.role}
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading && !email && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          Drafting your email...
        </div>
      )}

      {email && (
        <textarea
          value={email}
          onChange={e => setEmail(e.target.value)}
          rows={8}
          className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
        />
      )}

      {!email && !loading && (
        <p className="mt-3 text-sm text-gray-500">
          Generate a personalised follow-up email you can copy and send directly.
        </p>
      )}
    </div>
  );
}
