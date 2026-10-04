import { createFileRoute } from '@tanstack/react-router';
import { DataLab } from '@/components/workspaces/DataLab';
export const Route = createFileRoute('/data-lab')({ head: () => ({ meta: [{ title: 'Data Lab | SYNTRIX' }, { name: 'description', content: 'Explore local biological data with charts and tables.' }, { property: 'og:title', content: 'Data Lab | SYNTRIX' }, { property: 'og:description', content: 'Explore local biological data with charts and tables.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: DataLab });
