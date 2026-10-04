import { createFileRoute } from '@tanstack/react-router';
import { Settings } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/settings')({
  head: () => ({ meta: [{ title: 'Settings | SYNTRIX' }, { name: 'description', content: 'Manage your SYNTRIX preferences.' }, { property: 'og:title', content: 'Settings | SYNTRIX' }, { property: 'og:description', content: 'Manage your SYNTRIX preferences.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Settings,
});
