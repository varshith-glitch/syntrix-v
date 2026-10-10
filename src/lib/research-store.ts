import { useEffect, useState } from 'react';

export type Question = { id: string; text: string; createdAt: string; history: { text: string; at: string }[] };
export type Source = { id: string; title: string; doi: string | null; url: string; year: string | null; journal: string | null; authors: string | null; studyType: string | null; excerpt: string | null; addedAt: string };
export type Claim = { id: string; text: string; questionId: string | null; createdAt: string };
export type Hypothesis = { id: string; questionId: string | null; statement: string; createdAt: string };
export type Relation = 'supporting' | 'contradicting' | 'context';
export type EvidenceLink = { id: string; sourceId: string; target: 'claim' | 'hypothesis'; targetId: string; relation: Relation; note: string };
export type StepStatus = 'planned' | 'in progress' | 'done' | 'blocked';
export type Step = { id: string; hypothesisId: string; text: string; status: StepStatus };
export type Result = { id: string; hypothesisId: string; stepId: string | null; outcome: 'supports' | 'contradicts' | 'inconclusive'; summary: string; sourceIds: string[]; at: string };
export type ResearchState = { questions: Question[]; sources: Source[]; claims: Claim[]; hypotheses: Hypothesis[]; links: EvidenceLink[]; steps: Step[]; results: Result[]; activeQuestionId: string | null };

const KEY = 'syntrix:research-v2';
const EVT = 'syntrix-research';
const empty: ResearchState = { questions: [], sources: [], claims: [], hypotheses: [], links: [], steps: [], results: [], activeQuestionId: null };

export const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
export const now = () => new Date().toISOString();

export function load(): ResearchState {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<ResearchState> | null;
    if (parsed) return { ...empty, ...parsed };
    // Carry over the earlier single-draft Research Studio question.
    const legacy = localStorage.getItem('syntrix:research-question')?.trim();
    if (legacy) { const q: Question = { id: uid(), text: legacy, createdAt: now(), history: [] }; return { ...empty, questions: [q], activeQuestionId: q.id }; }
  } catch {}
  return empty;
}

export function update(fn: (s: ResearchState) => ResearchState) {
  const next = fn(load());
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function useResearch() {
  const [state, setState] = useState<ResearchState>(empty);
  useEffect(() => {
    const sync = () => setState(load());
    sync();
    window.addEventListener(EVT, sync); window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', sync); };
  }, []);
  return state;
}

/** Status is derived from records: "tested" requires at least one logged result. */
export function hypothesisStatus(s: ResearchState, id: string) {
  if (s.results.some(r => r.hypothesisId === id)) return 'tested';
  if (s.steps.some(st => st.hypothesisId === id)) return 'in validation';
  return 'proposed';
}

export function addSource(p: Omit<Source, 'addedAt' | 'id'> & { id?: string }): string {
  let id = '';
  update(s => {
    const existing = s.sources.find(x => (p.doi && x.doi?.toLowerCase() === p.doi.toLowerCase()) || x.url === p.url);
    if (existing) { id = existing.id; return s; }
    id = uid();
    return { ...s, sources: [{ ...p, id, addedAt: now() }, ...s.sources] };
  });
  return id;
}

export function linkSource(sourceId: string, target: 'claim' | 'hypothesis', targetId: string, relation: Relation, note = '') {
  update(s => {
    const i = s.links.findIndex(l => l.sourceId === sourceId && l.target === target && l.targetId === targetId);
    if (i >= 0) { const links = [...s.links]; links[i] = { ...links[i]!, relation, note: note || links[i]!.note }; return { ...s, links }; }
    return { ...s, links: [...s.links, { id: uid(), sourceId, target, targetId, relation, note }] };
  });
}
