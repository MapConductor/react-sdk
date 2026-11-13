import { useEffect, useRef, useState } from 'react';

/** Shorter loads finish before the dialog appears, so small samples do not flash it. */
const SHOW_DELAY_MS = 150;

/**
 * "Loading…" over the map while `visible`, put inside `<MapViewContainer>`
 * beside the collections it waits for. It does not block the map.
 */
export function LoadingOverlay({ visible }: { visible: boolean }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!visible) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visible]);
  if (!shown) return null;
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay-dialog">
        <span className="loading-overlay-spinner" aria-hidden="true" />
        Loading...
      </div>
    </div>
  );
}

/**
 * Whether any of a page's collections (`<Markers>`, `<Circles>`, `<Polylines>`,
 * `<Polygons>`) is still putting its states on the map.
 *
 * Spread `bind(key)` into each collection, one key per collection. A
 * collection that stops being rendered while it loads gets no `onAddEnd`, so a
 * key not bound in a render stops counting.
 */
export function useLoadingOverlay() {
  const [active, setActive] = useState<ReadonlySet<string>>(() => new Set());
  const bound = new Set<string>();
  const boundRef = useRef(bound);
  boundRef.current = bound;

  useEffect(() => {
    setActive(current => {
      const kept = [...current].filter(key => boundRef.current.has(key));
      return kept.length === current.size ? current : new Set(kept);
    });
  });

  const bind = (key: string) => {
    bound.add(key);
    return {
      onAddStart: () => setActive(current => (current.has(key) ? current : new Set(current).add(key))),
      onAddEnd: () =>
        setActive(current => {
          if (!current.has(key)) return current;
          const next = new Set(current);
          next.delete(key);
          return next;
        }),
    };
  };

  return { active: active.size > 0, bind };
}
