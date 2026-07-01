import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { company, role, notes, userSkills } = await request.json();

    const userMessage = `
Company: ${company}
Role: ${role}
${notes ? `Additional context: ${notes}` : ''}
${userSkills?.length ? `Candidate skills: ${userSkills.join(', ')}` : ''}
`.trim();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are an interview coach for engineering students in India applying for internships. Generate exactly 8 interview questions for the role described. Mix technical (5) and behavioural (3) questions. Return ONLY a valid JSON array of 8 strings. No explanation, no preamble, no markdown.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content ?? '[]';
    const questions: string[] = JSON.parse(content);

    return NextResponse.json({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Interview prep error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
