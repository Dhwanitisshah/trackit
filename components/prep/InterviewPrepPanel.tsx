'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import QuestionList from './QuestionList';
import type { Application } from '@/lib/types';

interface InterviewPrepPanelProps {
  application: Application;
  userSkills?: string[];
}

export default function InterviewPrepPanel({ application, userSkills = [] }: InterviewPrepPanelProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [prepId, setPrepId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing saved prep on mount
  useEffect(() => {
    async function loadExisting() {
      const supabase = createClient();
      const { data } = await supabase
        .from('interview_preps')
        .select('id, questions')
        .eq('application_id', application.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setPrepId(data.id);
        setQuestions(data.questions ?? []);
      }
    }
    loadExisting();
  }, [application.id]);

  async function generateQuestions() {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: application.company,
          role: application.role,
          notes: application.notes,
          userSkills,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to generate questions');

      const newQuestions: string[] = data.questions;
      setQuestions(newQuestions);

      // Upsert to interview_preps table
      const supabase = createClient();
      const { data: saved } = await supabase
        .from('interview_preps')
        .upsert(
          {
            application_id: application.id,
            questions: newQuestions,
            generated_at: new Date().toISOString(),
          },
          { onConflict: 'application_id' }
        )
        .select('id')
        .single();

      if (saved) setPrepId(saved.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate questions.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Interview Prep</h2>
        </div>

        {questions.length === 0 ? (
          <Button variant="primary" size="md" onClick={generateQuestions} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Questions'}
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={generateQuestions} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading && questions.length === 0 && (
        <div className="mt-6 flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-xs text-gray-400">
            5 technical + 3 behavioural questions for {application.role} at {application.company}
          </p>
          <QuestionList questions={questions} interviewPrepId={prepId} />
        </div>
      )}

      {questions.length === 0 && !loading && (
        <p className="mt-4 text-sm text-gray-500">
          Generate AI-powered interview questions tailored to this role and your skills.
        </p>
      )}
    </div>
  );
}
