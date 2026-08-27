import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer
  state={mapViewState}
  markerTilingOptions={markerTilingOptions}
  onMapClick={() => setSelected(null)}
>
  <Markers states={postOfficeMarkers} />
  {selected && <PostOfficeInfoBubble marker={selected} />}
</MapViewContainer>`,
  state: `const [selected, setSelected] = useState<MarkerState | null>(null);
const postOfficeMarkers = useMemo(() => postOffices.map(office => createMarkerState({
  id: office.id,
  position: createGeoPoint({ latitude: office.lat, longitude: office.lng }),
  extra: office,
  onClick: markerState => setSelected(markerState),
})), [postOffices]);
const markerTilingOptions = {
  ...MarkerTilingOptions.Default,
  iconScaleCallback: (_state: MarkerState, zoom: number) =>
    zoom > 10 ? 0.8 : zoom > 5 ? 0.5 : 0.2,
};`,
  explanation: {
    en: [
      'Use the batched Markers component for a large postal-office dataset and display details only for the selected item.',
      'The postOfficeMarkers are memoized from the postOffices dataset, each office stored in extra with an onClick that marks it selected.',
      'A markerTilingOptions.iconScaleCallback shrinks the icons as the zoom drops so a dense dataset stays readable, and PostOfficeInfoBubble opens only for the chosen office.',
    ],
    ja: [
      '大量の郵便局データを Markers コンポーネントで一括処理し、選択項目だけに詳細を表示します。',
      'postOfficeMarkers は postOffices データセットから useMemo で生成し、各局を extra に保持して選択用の onClick を持たせます。',
      'markerTilingOptions の iconScaleCallback がズームに応じてアイコンを縮小し、密集したデータでも見やすく保ちます。PostOfficeInfoBubble は選択した局にだけ開きます。',
    ],
    'es-419': [
      'Usa el componente Markers por lotes para un conjunto grande de oficinas postales y muestra detalles solo del elemento seleccionado.',
      'Los postOfficeMarkers se memorizan desde el conjunto postOffices, y cada oficina se guarda en extra con un onClick que la marca como seleccionada.',
      'Un markerTilingOptions.iconScaleCallback reduce los iconos a medida que baja el zoom para que un conjunto denso siga siendo legible, y PostOfficeInfoBubble se abre solo para la oficina elegida.',
    ],
    de: [
      'Die gebündelte Markers-Komponente für einen großen Postfilialdatensatz nutzen und Details nur für den ausgewählten Eintrag zeigen.',
      'Die postOfficeMarkers werden aus dem postOffices-Datensatz memoisiert, jede Filiale liegt in extra und trägt ein onClick, das sie als ausgewählt markiert.',
      'Ein markerTilingOptions.iconScaleCallback verkleinert die Icons beim Herauszoomen, damit ein dichter Datensatz lesbar bleibt, und PostOfficeInfoBubble öffnet sich nur für die gewählte Filiale.',
    ],
    th: [
      'ใช้คอมโพเนนต์ Markers แบบรวมกลุ่มกับชุดข้อมูลที่ทำการไปรษณีย์ขนาดใหญ่ และแสดงรายละเอียดเฉพาะรายการที่เลือก',
      'postOfficeMarkers ทำ memo มาจากชุดข้อมูล postOffices โดยเก็บที่ทำการแต่ละแห่งไว้ใน extra พร้อม onClick ที่ทำเครื่องหมายว่าถูกเลือก',
      'markerTilingOptions.iconScaleCallback ย่อไอคอนลงเมื่อระดับซูมลดลง ชุดข้อมูลที่หนาแน่นจึงยังอ่านออก และ PostOfficeInfoBubble จะเปิดเฉพาะที่ทำการที่เลือกไว้',
    ],
    hi: [
      'डाकघरों के बड़े डेटासेट के लिए बंडल किया हुआ Markers कंपोनेंट इस्तेमाल करें, और ब्योरा सिर्फ़ चुने हुए के लिए दिखाएँ।',
      'postOfficeMarkers postOffices डेटासेट से memo होते हैं; हर डाकघर extra में रहता है और उसका onClick उसे चुना हुआ बना देता है।',
      'markerTilingOptions.iconScaleCallback ज़ूम घटने पर आइकन छोटे कर देता है, ताकि सघन डेटासेट पढ़ा जा सके, और PostOfficeInfoBubble सिर्फ़ चुने हुए डाकघर के लिए खुलता है।',
    ],
  },
};

export default doc;
