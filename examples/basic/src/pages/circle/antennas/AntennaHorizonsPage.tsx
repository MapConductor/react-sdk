import { useEffect, useMemo, useState } from 'react';
import { createCircleState, createGeoPoint, type CircleEvent, type CircleState } from '@mapconductor/js-sdk-core';
import { Circles, InfoBubble } from '@mapconductor/js-sdk-react';
import { MapViewContainer } from '../../../MapViewContainer';
import { ControlPanel } from '../../../components/ControlPanel';
import { LoadingOverlay, useLoadingOverlay } from '../../../components/LoadingOverlay';

import { decodeAntennas, type Antenna } from './antennaData';
const CARRIERS = ['AT&T', 'T-Mobile / Sprint', 'Verizon', 'Others'];
const COLORS = ['37,99,235', '219,39,119', '217,119,6', '100,116,139'];
const STROKE_COLORS = COLORS.map(color => `rgba(${color},0.35)`);
const FILL_COLORS = COLORS.map(color => `rgba(${color},0.65)`);
// Drawn for this sample in the carrier's circle colour (not the carriers' logos); the
// Android and iOS samples ship the same drawing.
const CARRIER_ICONS = ['att', 'tmobile', 'verizon', 'others'].map(name => `/antennas/carrier-${name}.svg`);

// Keep the population out of React's development performance-entry payload.
class CircleSelection implements Iterable<CircleState> {
  readonly #states: readonly CircleState[];

  constructor(states: readonly CircleState[]) { this.#states = states; }
  [Symbol.iterator]() { return this.#states[Symbol.iterator](); }
}

export function AntennaHorizonsPage() {
  const [data, setData] = useState<Antenna[] | null>(null);
  const [error, setError] = useState('');
  const [carriers, setCarriers] = useState([0, 1, 2, 3]);
  const [alaska, setAlaska] = useState(false);
  const [tap, setTap] = useState<Antenna | null>(null);
  const loading = useLoadingOverlay();
  useEffect(() => {
    const abort = new AbortController();
    fetch('/antennas/us-antennas.bin', { signal: abort.signal }).then(r => {
      if (!r.ok) throw new Error(`Data download: ${r.status}`);
      return r.arrayBuffer();
    }).then(b => setData(decodeAntennas(b))).catch(e => { if (!abort.signal.aborted) setError(String(e)); });
    return () => abort.abort();
  }, []);
  // 723,800 states take seconds to make on a phone (each carries its own accessors), so
  // they are made in slices that leave the page free to draw between them.
  const [allStates, setAllStates] = useState<CircleState[]>([]);
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const onCellClick = (event: CircleEvent) => {
      const id = event.state.extra;
      if (typeof id === 'string' && id.startsWith('asr-')) setTap(data[Number(id.slice(4))] ?? null);
    };
    const made: CircleState[] = new Array(data.length);
    let next = 0;
    const slice = () => {
      if (cancelled) return;
      const until = performance.now() + 12;
      while (next < data.length && performance.now() < until) {
        for (const end = Math.min(next + 2_000, data.length); next < end; next++) {
          const a = data[next];
          const id = `asr-${a.registration}`;
          made[next] = createCircleState({
            id, center: createGeoPoint(a), radiusMeters: 500, geodesic: true, zIndex: a.registration,
            fillColor: FILL_COLORS[a.carrier], strokeColor: STROKE_COLORS[a.carrier], strokeWidth: 0.5,
            extra: id, onClick: onCellClick,
          });
        }
      }
      if (next < data.length) setTimeout(slice, 0);
      else setAllStates(made);
    };
    slice();
    return () => { cancelled = true; };
  }, [data]);
  const preparing = data != null && allStates.length !== data.length;
  const states = useMemo(() => {
    if (carriers.length === CARRIERS.length) return allStates;
    if (!data || carriers.length === 0 || preparing) return [];
    return allStates.filter((_, index) => carriers.includes(data[index].carrier));
  }, [allStates, data, carriers]);
  const selection = useMemo(() => new CircleSelection(states), [states]);
  useEffect(() => { setTap(null); }, [states]);
  return <MapViewContainer key={String(alaska)} initialCamera={alaska ? { lat: 64, lng: -150, zoom: 5 } : { lat: 39, lng: -98, zoom: 4 }} onMapClick={() => setTap(null)}>
    <Circles states={selection} {...loading.bind('circles')} />
    <LoadingOverlay visible={loading.active || preparing} />
    {tap && <InfoBubble position={createGeoPoint(tap)}><div>{CARRIERS[tap.carrier]}<br />Cell position · Display radius: 500 m</div></InfoBubble>}
    <ControlPanel title="US cell positions (MCC 310–314)">
      <div>{error || (!data ? 'Loading OpenCellID data…' : `${states.length.toLocaleString()} / ${data.length.toLocaleString()} circles`)}</div>
      <button onClick={() => setAlaska(!alaska)}>{alaska ? 'US overview' : 'Alaska'}</button>
      <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
        {CARRIERS.map((name, index) => {
          const on = carriers.includes(index);
          return <button key={name} type="button" aria-pressed={on} title={name}
            onClick={() => setCarriers(current => on ? current.filter(c => c !== index) : [...current, index])}
            style={{
              flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 2px', borderRadius: 8, cursor: 'pointer', background: 'transparent',
              border: `2px solid ${on ? `rgb(${COLORS[index]})` : 'transparent'}`,
              color: 'inherit', font: 'inherit', fontSize: 12, lineHeight: 1.2, opacity: on ? 1 : 0.45,
            }}>
            <img src={CARRIER_ICONS[index]} alt="" width={32} height={32} style={{ filter: on ? undefined : 'grayscale(1)' }} />
            {name}
          </button>;
        })}
      </div>
      <p>Cell positions shown as 500 m radius circles; not signal coverage. Showing all cells for the selected carriers. MCC 310–314; not a complete tower inventory.</p>
      <div>Cell tower data from <a href="https://opencellid.org">OpenCellID</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></div>
    </ControlPanel>
  </MapViewContainer>;
}
