import React from 'react';

/**
 * Minimal native-History illustration.
 * In a routed application, prefer expressing this through the existing router.
 */
export function HistoryAwareSheet() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onPopState = () => setOpen(Boolean(history.state?.filterSheet));
    window.addEventListener('popstate', onPopState);
    setOpen(Boolean(history.state?.filterSheet));
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const show = () => {
    if (open) return;
    history.pushState({ ...(history.state ?? {}), filterSheet: true }, '');
    setOpen(true);
  };

  const dismiss = () => {
    if (!open) return;
    if (history.state?.filterSheet) history.back();
    else setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={show}>Filters</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Filters" className="sheet">
          <button type="button" onClick={dismiss} aria-label="Close filters">Close</button>
          {/* Filter controls */}
        </div>
      )}
    </>
  );
}
