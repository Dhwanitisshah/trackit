'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AnswerInput from './AnswerInput';

interface QuestionListProps {
  questions: string[];
  interviewPrepId?: string;
}

export default function QuestionList({ questions, interviewPrepId }: QuestionListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!interviewPrepId) return;
    async function loadAnswers() {
      const supabase = createClient();
      const { data } = await supabase
        .from('interview_answers')
        .select('question_index, answer')
        .eq('interview_prep_id', interviewPrepId);
      if (data) {
        const map: Record<number, string> = {};
        data.forEach(r => { map[r.question_index] = r.answer; });
        setAnswers(map);
      }
    }
    loadAnswers();
  }, [interviewPrepId]);

  async function copyToClipboard(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <ol className="space-y-4">
      {questions.map((question, index) => (
        <li key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {index + 1}
            </span>
            <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{question}</p>
            <button
              onClick={() => copyToClipboard(question, index)}
              className="flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Copy question"
            >
              {copiedIndex === index ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          {interviewPrepId && (
            <AnswerInput
              interviewPrepId={interviewPrepId}
              questionIndex={index}
              initialAnswer={answers[index] ?? null}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
