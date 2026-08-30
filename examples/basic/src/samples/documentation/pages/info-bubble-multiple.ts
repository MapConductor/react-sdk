import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
  {selectedMarkers.map(marker => (
    <InfoBubble key={marker.id} marker={marker}>
      {marker.extra as string}
    </InfoBubble>
  ))}
</MapViewContainer>`,
  state: `const [selectedMarkers, setSelectedMarkers] = useState<MarkerState[]>([]);
const markers = useMemo(() => positions.map((position, index) => createMarkerState({
  id: \`marker-\${index}\`, position,
  onClick: markerState => setSelectedMarkers(current => [...current, markerState]),
})), [positions]);
const activeMarker = selectedMarkers.at(-1) ?? null;`,
  explanation: {
    en: [
      'Keep multiple markers selected and render one independently positioned bubble for each.',
      'selectedMarkers accumulates every clicked MarkerState rather than keeping only the most recent one.',
      'Mapping over that array renders one InfoBubble per marker, each keyed by marker.id and positioned independently.',
    ],
    ja: [
      '複数のマーカーを選択状態に保ち、それぞれの位置へ独立した吹き出しを描画します。',
      'selectedMarkers は最新の1件だけでなく、クリックされた MarkerState をすべて蓄積します。',
      'その配列を map すると、marker.id を key にした InfoBubble がマーカーごとに1つずつ、独立した位置に描画されます。',
    ],
    'es-419': [
      'Mantiene varios marcadores seleccionados y dibuja un globo posicionado de forma independiente para cada uno.',
      'selectedMarkers acumula cada MarkerState tocado en lugar de conservar solo el más reciente.',
      'Recorrer ese arreglo dibuja un InfoBubble por marcador, cada uno con clave marker.id y ubicado de forma independiente.',
    ],
    de: [
      'Mehrere Marker ausgewählt lassen und für jeden eine eigenständig positionierte Sprechblase rendern.',
      'selectedMarkers sammelt jeden angeklickten MarkerState, statt nur den zuletzt angeklickten zu behalten.',
      'Das Mappen über dieses Array rendert eine InfoBubble je Marker, jede mit marker.id als key und unabhängig positioniert.',
    ],
    th: [
      'คงมาร์กเกอร์ที่เลือกไว้หลายอัน และเรนเดอร์บับเบิลที่วางตำแหน่งอิสระให้แต่ละอัน',
      'selectedMarkers สะสม MarkerState ที่ถูกคลิกทุกอัน แทนที่จะเก็บเฉพาะอันล่าสุด',
      'การวนอาร์เรย์นั้นจะเรนเดอร์ InfoBubble หนึ่งอันต่อมาร์กเกอร์หนึ่งอัน แต่ละอันใช้ marker.id เป็น key และวางตำแหน่งแยกกัน',
    ],
    hi: [
      'कई मार्कर चुने रहने दें और हर एक के लिए स्वतंत्र रूप से टिका हुआ एक बबल रेंडर करें।',
      'selectedMarkers सिर्फ़ आख़िरी नहीं, बल्कि क्लिक किए गए हर MarkerState को जमा करता रहता है।',
      'उस सरणी पर मैप करने से हर मार्कर के लिए एक InfoBubble बनता है — हर एक का key marker.id, और हर एक की जगह अलग।',
    ],
  },
};

export default doc;
