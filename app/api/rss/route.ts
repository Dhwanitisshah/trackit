import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import type { RSSJobListing } from '@/lib/types';

export const dynamic = 'force-dynamic';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'dc:creator'],
  },
});

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function daysAgo(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skillsParam = searchParams.get('skills') ?? '';
  const role = searchParams.get('role') ?? '';

  const skills = skillsParam
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const feeds = [
    { url: 'https://internshala.com/rss/internships.xml', source: 'internshala' as const },
    { url: 'https://www.freshersworld.com/rss/jobs.xml', source: 'freshersworld' as const },
  ];

  const allItems: RSSJobListing[] = [];
  let anySuccess = false;

  for (const { url, source } of feeds) {
    try {
      const feed = await parser.parseURL(url);
      anySuccess = true;

      for (const item of feed.items ?? []) {
        const itemAny = item as unknown as Record<string, unknown>;
        const rawContent =
          (itemAny['content:encoded'] as string | undefined) ||
          item.content ||
          item.contentSnippet ||
          '';
        const title = item.title ?? '';
        const description = stripHTML(rawContent).slice(0, 600);
        const creator =
          (itemAny['dc:creator'] as string | undefined) ||
          (item.creator as string | undefined) ||
          '';
        const company = creator || extractCompany(title) || source;
        const pubDate = item.pubDate || item.isoDate || '';

        const searchText = `${title} ${description}`.toLowerCase();
        const matchedSkills = skills.filter(s => searchText.includes(s));
        const missingSkills = skills.filter(s => !searchText.includes(s));
        const matchScore =
          skills.length > 0
            ? Math.round((matchedSkills.length / skills.length) * 100)
            : 0;

        allItems.push({
          id: crypto.randomUUID(),
          title,
          company,
          description,
          url: item.link ?? '',
          pubDate: daysAgo(pubDate),
          source,
          matchScore,
          matchedSkills,
          missingSkills,
        });
      }
    } catch (err) {
      console.warn(`RSS feed failed (${source}):`, err instanceof Error ? err.message : err);
    }
  }

  if (!anySuccess) {
    return NextResponse.json({ error: 'Could not load listings' }, { status: 500 });
  }

  let results = allItems;

  // Filter by role keyword if provided
  if (role.trim()) {
    const roleKeywords = role.toLowerCase().split(/\s+/).filter(Boolean);
    results = results.filter(item =>
      roleKeywords.some(kw => item.title.toLowerCase().includes(kw))
    );
    // Fall back to all results if filter leaves nothing
    if (results.length === 0) results = allItems;
  }

  // Sort by matchScore desc, then by pubDate recency
  results.sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({ listings: results.slice(0, 8) });
}

function extractCompany(title: string): string {
  // Try to extract "at CompanyName" or "@ CompanyName" from title
  const match = title.match(/(?:at|@)\s+([A-Za-z0-9 &.]+)/i);
  return match?.[1]?.trim() ?? '';
}
