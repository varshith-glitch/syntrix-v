import { createFileRoute } from '@tanstack/react-router';
import { HypothesisEngine } from '@/components/workspaces/ResearchSuite';
export const Route = createFileRoute('/hypothesis')({
  head: () => ({ meta: [{ title: 'Hypothesis Engine | SYNTRIX' }, { name: 'description', content: 'Search real literature and propose evidence-linked hypotheses.' }, { property: 'og:title', content: 'Hypothesis Engine | SYNTRIX' }, { property: 'og:description', content: 'Search real literature and propose evidence-linked hypotheses.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: HypothesisEngine,
});
