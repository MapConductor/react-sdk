import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** The element under the map stage where SamplePageLayout puts a page's below-map card. */
export const BelowMapSlot = createContext<HTMLElement | null>(null);

/**
 * A sample's options as a card under the map instead of a ControlPanel over it, for pages
 * whose controls would hide too much of the map.
 *
 * The page renders inside the map stage, so the card is portalled out to the layout's slot.
 * The slot is only known after mount, which also keeps the server-rendered page (where
 * portals do not render) and the first client paint the same.
 */
export function BelowMapCard({ title, children }: { title: string; children: ReactNode }) {
  const slot = useContext(BelowMapSlot);
  if (!slot) return null;
  return createPortal(
    <section className="below-map-card">
      <h3 className="below-map-card-title">{title}</h3>
      {children}
    </section>,
    slot,
  );
}
