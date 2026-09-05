import type { MarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubble } from '@mapconductor/js-sdk-react';
import type { StreetTree } from './streetTreeData';

export function StreetTreeInfoBubble({ marker }: { marker: MarkerState }) {
  const tree = marker.extra as unknown as StreetTree;
  if (!tree) return null;
  return (
    <InfoBubble marker={marker} bubbleColor="#ffffff" borderColor="#111111">
      <div className="bubble-content">
        <strong>{tree.species}</strong>
        <table style={{ borderSpacing: '0.5rem 0.15rem', fontSize: '0.85rem' }}>
          <tbody>
            <tr><td>樹高</td><td>{tree.heightM.toFixed(1)} m</td></tr>
            <tr><td>幹周</td><td>{tree.girthCm} cm</td></tr>
            <tr><td>行政区</td><td>{tree.ward}</td></tr>
            <tr><td>路線</td><td>{tree.roadName}</td></tr>
          </tbody>
        </table>
      </div>
    </InfoBubble>
  );
}
