/** A small subset of public/postoffice/postoffices.json, usable in any host app. */
export const postOfficeState = `const postOffices = useMemo(() => [
  { id: 'maruyama', lat: 43.043751, lng: 141.305428, name: '円山西町簡易郵便局' },
  { id: 'jingu', lat: 43.057305, lng: 141.311483, name: '北海道神宮前郵便局' },
  { id: 'miyanomori', lat: 43.057305, lng: 141.303150, name: '札幌宮の森郵便局' },
  { id: 'araiyama', lat: 43.050833, lng: 141.298262, name: '札幌荒井山簡易郵便局' },
  { id: 'futagoyama', lat: 43.043085, lng: 141.318733, name: '札幌双子山郵便局' },
], []);
const [selected, setSelected] = useState<MarkerState | null>(null);
const postOfficeMarkers = useMemo(() => postOffices.map(office => createMarkerState({
  id: office.id,
  position: createGeoPoint({ latitude: office.lat, longitude: office.lng }),
  extra: office.name,
  onClick: markerState => setSelected(markerState),
})), [postOffices]);`;
