import { useEffect, useMemo, useState } from 'react';
import { createCircleState, createGeoPoint, type CircleEvent, type CircleState } from '@mapconductor/js-sdk-core';
import { Circles, InfoBubble } from '@mapconductor/js-sdk-react';
import { MapViewContainer } from '../../../MapViewContainer';
import { ControlPanel } from '../../../components/ControlPanel';

import { decodeAntennas, type Antenna } from './antennaData';
const CARRIERS = ['AT&T', 'T-Mobile / Sprint', 'Verizon', 'Others'];
const COLORS = ['37,99,235', '219,39,119', '217,119,6', '100,116,139'];
const STROKE_COLORS = COLORS.map(color => `rgba(${color},0.35)`);
const FILL_COLORS = COLORS.map(color => `rgba(${color},0.65)`);

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
  useEffect(() => {
    const abort = new AbortController();
    fetch('/antennas/us-antennas.bin', { signal: abort.signal }).then(r => {
      if (!r.ok) throw new Error(`Data download: ${r.status}`);
      return r.arrayBuffer();
    }).then(b => setData(decodeAntennas(b))).catch(e => { if (!abort.signal.aborted) setError(String(e)); });
    return () => abort.abort();
  }, []);
  const allStates = useMemo(() => {
    const onCellClick = (event: CircleEvent) => {
      const id = event.state.extra;
      if (typeof id === 'string' && id.startsWith('asr-')) setTap(data?.[Number(id.slice(4))] ?? null);
    };
    return (data ?? []).map(a => {
      const id = `asr-${a.registration}`;
      return createCircleState({
        id, center: createGeoPoint(a), radiusMeters: 500, geodesic: true, zIndex: a.registration,
        fillColor: FILL_COLORS[a.carrier], strokeColor: STROKE_COLORS[a.carrier], strokeWidth: 0.5,
        extra: id, onClick: onCellClick,
      });
    });
  }, [data]);
  const counts = useMemo(() => {
    const result = [0, 0, 0, 0];
    for (const row of data ?? []) result[row.carrier]++;
    return result;
  }, [data]);
  const states = useMemo(() => {
    if (carriers.length === CARRIERS.length) return allStates;
    if (!data || carriers.length === 0) return [];
    return allStates.filter((_, index) => carriers.includes(data[index].carrier));
  }, [allStates, data, carriers]);
  const selection = useMemo(() => new CircleSelection(states), [states]);
  useEffect(() => { setTap(null); }, [states]);
  return <MapViewContainer key={String(alaska)} initialCamera={alaska ? { lat: 64, lng: -150, zoom: 5 } : { lat: 39, lng: -98, zoom: 4 }} onMapClick={() => setTap(null)}>
    <Circles states={selection} />
    {tap && <InfoBubble position={createGeoPoint(tap)}><div>{CARRIERS[tap.carrier]}<br />Cell position · Display radius: 500 m</div></InfoBubble>}
    <ControlPanel title="US cell positions (MCC 310–314)">
      <div>{error || (!data ? 'Loading OpenCellID data…' : `${states.length.toLocaleString()} / ${data.length.toLocaleString()} circles`)}</div>
      <button onClick={() => setAlaska(!alaska)}>{alaska ? 'US overview' : 'Alaska'}</button>
      {CARRIERS.map((name, index) => <label key={name} style={{ display: 'block' }}><input type="checkbox" checked={carriers.includes(index)} onChange={e => setCarriers(current => e.target.checked ? [...current, index] : current.filter(c => c !== index))} />{name} ({counts[index].toLocaleString()})</label>)}
      <p>Cell positions shown as 500 m radius circles; not signal coverage. Showing all cells for the selected carriers. MCC 310–314; not a complete tower inventory.</p>
      <div>Cell tower data from <a href="https://opencellid.org">OpenCellID</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></div>
    </ControlPanel>
  </MapViewContainer>;
}
