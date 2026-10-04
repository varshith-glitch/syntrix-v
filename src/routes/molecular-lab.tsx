import { createFileRoute } from '@tanstack/react-router';
import { MolecularWorkspace } from '@/components/molecular/MolecularWorkspace';
export const Route = createFileRoute('/molecular-lab')({
  head: () => ({ meta: [{ title: 'Molecular Lab | SYNTRIX' }, { name: 'description', content: 'Explore a DNA sequence in an interactive 3D molecular workspace.' }, { property: 'og:title', content: 'Molecular Lab | SYNTRIX' }, { property: 'og:description', content: 'Analyze base composition and explore DNA in three dimensions.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: MolecularWorkspace,
});
