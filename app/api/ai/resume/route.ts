import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { createClient } from '@/lib/supabase/server';
import type { ResumeContent } from '@/lib/types';

function extractJSON(text: string): ResumeContent {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('No JSON object found');
  return JSON.parse(text.slice(first, last + 1));
}

export async function POST(request: NextRequest) {
  try {
    const { profile, skills, jd_text } = await request.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a resume writing expert for engineering students in India. Given a student profile and a job description, generate ATS-friendly resume content. Return ONLY a raw valid JSON object with this exact structure, no markdown, no explanation, no preamble text before or after the JSON:
{
  "summary": "string (2-3 sentences, tailored to the JD)",
  "skills": ["string array of relevant skills from their profile"],
  "experience": [],
  "education": [{"degree": "string", "college": "string", "year": "string"}],
  "projects": [{"name": "string", "description": "string", "tech": ["string"]}]
}`,
        },
        {
          role: 'user',
          content: `Student profile: ${JSON.stringify(profile)}\nSkills: ${skills.join(', ')}\nJob description: ${jd_text}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    let content: ResumeContent;

    try {
      content = JSON.parse(raw);
    } catch {
      content = extractJSON(raw);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('resumes').upsert({
        user_id: user.id,
        jd_text,
        content,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Resume generation error:', message);
    return NextResponse.json(
      { error: 'Could not generate resume, please try again' },
      { status: 500 }
    );
  }
}
