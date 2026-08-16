import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer initialCamera={INIT_CAMERA}>
  <Marker state={marker} />
  <InfoBubble
    marker={marker}
    bubbleColor={fillColor}
    borderColor={strokeColor}
    borderWidth={strokeWidth}
    cornerRadius={6}
    contentPadding={10}
  >
    <div style={{ color: fontColor }}>Custom Styled Bubble</div>
  </InfoBubble>
</MapViewContainer>`,
  state: `const [fillColor, setFillColor] = useState('#ffffff');
const [strokeColor, setStrokeColor] = useState('#111827');
const [fontColor, setFontColor] = useState('#111827');
const [markerColor, setMarkerColor] = useState('#ef4444');
const [strokeWidth, setStrokeWidth] = useState(2.0);
const [markerScale, setMarkerScale] = useState(1.0);

useEffect(() => {
  marker.icon = new DefaultMarkerIcon({ fillColor: markerColor, scale: markerScale });
}, [marker, markerColor, markerScale]);`,
  explanation: {
    en: [
      'InfoBubble accepts bubbleColor, borderColor and borderWidth, so the bubble chrome — tail included — can be restyled without drawing it yourself.',
      'The bubble content is ordinary JSX, so the font color is just an inline style on the content element.',
      'The marker is restyled by assigning a new DefaultMarkerIcon with fillColor and scale; the map picks up the change automatically.',
    ],
    ja: [
      'InfoBubble は bubbleColor・borderColor・borderWidth を受け取るため、しっぽも含めた吹き出しの外観を自前で描かずに変更できます。',
      '吹き出しの中身は通常の JSX なので、文字色はコンテンツ要素のスタイルで指定するだけです。',
      'マーカーは fillColor と scale を指定した DefaultMarkerIcon を代入し直すだけで、地図側が自動的に反映します。',
    ],
    'es-419': [
      'InfoBubble acepta bubbleColor, borderColor y borderWidth, por lo que el marco del globo — punta incluida — puede reestilizarse sin dibujarlo manualmente.',
      'El contenido del globo es JSX normal, así que el color de la fuente es solo un estilo en el elemento de contenido.',
      'El marcador se reestiliza asignando un nuevo DefaultMarkerIcon con fillColor y scale; el mapa aplica el cambio automáticamente.',
    ],
  },
};

export default doc;
