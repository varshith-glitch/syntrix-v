import { createFileRoute } from '@tanstack/react-router';
import { HypothesisEngine } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/hypothesis')({
  head: () => ({ meta: [{ title: 'Hypothesis Engine | SYNTRIX' }, { name: 'description', content: 'Develop testable biological hypotheses.' }, { property: 'og:title', content: 'Hypothesis Engine | SYNTRIX' }, { property: 'og:description', content: 'Develop testable biological hypotheses.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: HypothesisEngine,
});
