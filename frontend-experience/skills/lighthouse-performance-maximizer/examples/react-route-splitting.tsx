import { lazy, Suspense } from 'react';

const HeavyEditor = lazy(() => import('./HeavyEditor'));

export function EditorRoute() {
  return (
    <Suspense fallback={<div aria-busy="true">Loading editor…</div>}>
      <HeavyEditor />
    </Suspense>
  );
}

// Route/feature splitting is useful only when the split module is not needed
// for the critical first view. Measure request waterfalls and TBT afterward.
