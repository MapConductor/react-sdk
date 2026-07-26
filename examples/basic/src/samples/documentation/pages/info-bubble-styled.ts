import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
  {activeMarker && (
    <InfoBubbleCustom marker={activeMarker} tailOffset={{ x: 0, y: 0.5 }}>
      <StyledContent />
    </InfoBubbleCustom>
  )}
</MapViewContainer>`,
  state: `const [selectedMarkers, setSelectedMarkers] = useState<MarkerState[]>([]);
const markers = useMemo(() => positions.map((position, index) => createMarkerState({
  id: \`marker-\${index}\`, position,
  onClick: markerState => setSelectedMarkers(current => [...current, markerState]),
})), [positions]);
const activeMarker = selectedMarkers.at(-1) ?? null;`,
  explanation: {
    en: [
      'Use a custom bubble component when the content, border, shadow, and tail need application-defined styling.',
      'Clicks push each MarkerState into selectedMarkers, and activeMarker is simply the most recent one.',
      'InfoBubbleCustom accepts a tailOffset and arbitrary StyledContent, handing the app full control over the border, shadow and pointer.',
    ],
    ja: [
      '内容・枠線・影・しっぽをアプリ独自に装飾する場合はカスタム吹き出しを使用します。',
      'クリックのたびに MarkerState を selectedMarkers へ追加し、activeMarker は最後に選んだものになります。',
      'InfoBubbleCustom は tailOffset と任意の StyledContent を受け取り、枠線・影・しっぽをアプリ側で完全に制御できます。',
    ],
    'es-419': [
      'Usa un globo personalizado cuando el contenido, borde, sombra y punta necesitan un estilo definido por la aplicación.',
      'Cada clic agrega un MarkerState a selectedMarkers, y activeMarker es simplemente el más reciente.',
      'InfoBubbleCustom acepta un tailOffset y un StyledContent arbitrario, dando a la aplicación control total sobre el borde, la sombra y la punta.',
    ],
  },
};

export default doc;
