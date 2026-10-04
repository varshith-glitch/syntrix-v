import { createFileRoute } from '@tanstack/react-router';
import { Notifications } from '@/components/workspaces/OtherWorkspaces';
export const Route = createFileRoute('/notifications')({
  head: () => ({ meta: [{ title: 'Notifications | SYNTRIX' }, { name: 'description', content: 'Keep up with research activity.' }, { property: 'og:title', content: 'Notifications | SYNTRIX' }, { property: 'og:description', content: 'Keep up with research activity.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Notifications,
});
