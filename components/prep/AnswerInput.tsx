'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

interface AnswerInputProps {
  interviewPrepId: string;
  questionIndex: number;
  initialAnswer: string | null;
}

export default function AnswerInput({ interviewPrepId, questionIndex, initialAnswer }: AnswerInputProps) {
  const [answer, setAnswer] = useState(initialAnswer ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(initialAnswer ? new Date() : null);

  useEffect(() => {
    setAnswer(initialAnswer ?? '');
    if (initialAnswer) setLastSaved(new Date());
  }, [initialAnswer]);

  async function saveAnswer() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('interview_answers').upsert(
      {
        interview_prep_id: interviewPrepId,
        question_index: questionIndex,
        answer,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'interview_prep_id,question_index' }
    );
    setSaving(false);
    setSaved(true);
    setLastSaved(new Date());
    setTimeout(() => setSaved(false), 2000);
  }

  function minutesAgo(date: Date) {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 minute ago';
    return `${mins} minutes ago`;
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        rows={4}
        placeholder="Write your answer here..."
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{answer.length} characters</span>
          {lastSaved && !saved && (
            <span className="text-xs text-gray-400">Last saved: {minutesAgo(lastSaved)}</span>
          )}
          {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
        <Button variant="secondary" size="sm" onClick={saveAnswer} disabled={saving || !answer.trim()}>
          {saving ? 'Saving...' : 'Save answer'}
        </Button>
      </div>
    </div>
  );
}
