import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { company, role, notes, full_name, skills, profile } = await request.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a cover letter writing expert for engineering students in India applying for internships. Write a professional, genuine, and concise cover letter. Do not use generic phrases like "I am writing to express my interest". Sound like a real student who has done their research. Keep it to 3 paragraphs maximum. Return ONLY the cover letter body as plain text. No subject line. No "Dear Hiring Manager" header. No explanation. No preamble.',
        },
        {
          role: 'user',
          content: `Write a cover letter for ${full_name ?? 'the applicant'} applying to ${company} for the ${role} internship.
Their skills: ${Array.isArray(skills) ? skills.join(', ') : 'Not specified'}
Their college: ${profile?.college ?? 'Not specified'}, Year: ${profile?.year ?? 'Not specified'}
Additional context about the role: ${notes ?? 'None provided'}`,
        },
      ],
      temperature: 0.75,
      max_tokens: 600,
    });

    const body = completion.choices[0]?.message?.content ?? '';

    // Save to Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && request.headers.get('x-application-id')) {
      const applicationId = request.headers.get('x-application-id');
      await supabase.from('cover_letters').upsert(
        { application_id: applicationId, body, generated_at: new Date().toISOString() },
        { onConflict: 'application_id' }
      );
    }

    return NextResponse.json({ body });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate cover letter';
    console.error('Cover letter error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
