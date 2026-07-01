import { NextRequest, NextResponse } from 'next/server';

// Force dynamic so Next.js never caches this route handler
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skillsParam = searchParams.get('skills') ?? '';
  const role = searchParams.get('role') ?? 'software engineer intern';

  const skills = skillsParam
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  // Build a richer search query: role + top 3 skills so Adzuna returns
  // jobs that actually mention the candidate's tech stack
  const topSkills = skills.slice(0, 3).join(' ');
  const what = [role, topSkills].filter(Boolean).join(' ');

  try {
    const url = new URL('https://api.adzuna.com/v1/api/jobs/in/search/1');
    url.searchParams.set('app_id', appId!);
    url.searchParams.set('app_key', appKey!);
    url.searchParams.set('results_per_page', '10'); // fetch 10, return best 5
    url.searchParams.set('what', what);
    url.searchParams.set('where', 'india');
    url.searchParams.set('sort_by', 'date');        // freshest results on refresh
    url.searchParams.set('content-type', 'application/json');

    // cache: 'no-store' — never cache Adzuna responses so Refresh gives fresh data
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Adzuna ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const results: Record<string, unknown>[] = data.results ?? [];

    const listings = results.map((job) => {
      const title = (job.title as string) ?? '';
      const description = (job.description as string) ?? '';
      // Also pull category label into searchable text — Adzuna often
      // puts the tech domain there even when descriptions are short
      const categoryLabel =
        typeof job.category === 'object' && job.category !== null
          ? ((job.category as Record<string, unknown>).label as string) ?? ''
          : '';
      const searchText = `${title} ${description} ${categoryLabel}`.toLowerCase();

      const matchedSkills = skills.filter(skill => {
        // Normalise common variations: "c++" → "c++|cpp", "node.js" → "node"
        const variants = [skill, skill.replace(/\./g, ''), skill.replace(/\+\+/, 'pp')];
        return variants.some(v => searchText.includes(v));
      });
      const missingSkills = skills.filter(s => !matchedSkills.includes(s));
      const matchScore =
        skills.length > 0
          ? Math.round((matchedSkills.length / skills.length) * 100)
          : 50; // no skills → neutral score

      const company =
        typeof job.company === 'object' && job.company !== null
          ? ((job.company as Record<string, unknown>).display_name as string) ?? 'Unknown'
          : 'Unknown';

      const location =
        typeof job.location === 'object' && job.location !== null
          ? ((job.location as Record<string, unknown>).display_name as string) ?? 'India'
          : 'India';

      return {
        id: job.id as string,
        title,
        company,
        location,
        description: description.slice(0, 500),
        url: (job.redirect_url as string) ?? '',
        matchScore,
        matchedSkills,
        missingSkills,
      };
    });

    // Sort by match score descending, return top 5
    const sorted = listings
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return NextResponse.json({ listings: sorted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
    console.error('Jobs API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
