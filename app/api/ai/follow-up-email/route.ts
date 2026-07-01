import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { company, role, applied_date, notes, full_name } = await request.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional email writing assistant for engineering students in India applying for internships. Write a short, polite, genuine follow-up email for an internship application. Do NOT sound like a template. Sound like a real student. Return ONLY the email body as plain text. No subject line. No explanation. No preamble.',
        },
        {
          role: 'user',
          content: `Write a follow-up email for my application to ${company} for the ${role} role. I applied on ${applied_date ?? 'a few weeks ago'}. My name is ${full_name ?? 'the applicant'}. Additional context: ${notes ?? 'none'}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 512,
    });

    const email = completion.choices[0]?.message?.content ?? '';
    return NextResponse.json({ email });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate email';
    console.error('Follow-up email error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
