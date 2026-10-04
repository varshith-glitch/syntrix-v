import { createFileRoute } from '@tanstack/react-router';
import { ValidationCenter } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/validation')({
  head: () => ({ meta: [{ title: 'Validation Center | SYNTRIX' }, { name: 'description', content: 'Evaluate and validate research findings.' }, { property: 'og:title', content: 'Validation Center | SYNTRIX' }, { property: 'og:description', content: 'Evaluate and validate research findings.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ValidationCenter,
});
