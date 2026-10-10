import { createServerFn } from '@tanstack/react-start';

export type Paper = { id: string; title: string; doi: string | null; url: string; year: string | null; journal: string | null; authors: string | null; studyType: string | null; excerpt: string | null };

const clean = (s: unknown) => typeof s === 'string' ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null;

// Real literature retrieval from Europe PMC (public, no key). Returns only fields the source provides.
export const searchLiterature = createServerFn({ method: 'POST' })
  .validator((input: { query: string }) => {
    const query = String(input?.query ?? '').trim();
    if (query.length < 3 || query.length > 300) throw new Error('Enter a question between 3 and 300 characters.');
    return { query };
  })
  .handler(async ({ data }): Promise<{ total: number; papers: Paper[] }> => {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(data.query)}&format=json&resultType=core&pageSize=10&sort=RELEVANCE`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Literature search is unavailable right now (${res.status}).`);
    const json = await res.json() as { hitCount?: number; resultList?: { result?: Record<string, any>[] } };
    const papers = (json.resultList?.result ?? []).filter(r => clean(r['title'])).map((r): Paper => {
      const doi = clean(r['doi']);
      const types: string[] = r['pubTypeList']?.pubType ?? [];
      const type = types.find(t => !/journal article/i.test(t)) ?? types[0] ?? null;
      const abs = clean(r['abstractText']);
      return {
        id: `${r['source']}:${r['id']}`, title: clean(r['title'])!, doi,
        url: doi ? `https://doi.org/${doi}` : `https://europepmc.org/article/${r['source']}/${r['id']}`,
        year: clean(r['pubYear']), journal: clean(r['journalInfo']?.journal?.title), authors: clean(r['authorString']),
        studyType: type, excerpt: abs ? (abs.length > 420 ? `${abs.slice(0, 420)}…` : abs) : null,
      };
    });
    return { total: json.hitCount ?? papers.length, papers };
  });
