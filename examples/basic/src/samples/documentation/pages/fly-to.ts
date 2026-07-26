import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<button onClick={() => mapViewState.moveCameraTo(destination, 1000)}>
  Fly to destination
</button>

<MapViewContainer state={mapViewState}>
  <Markers states={destinations} />
</MapViewContainer>`,
  state: `const destination = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
  zoom: 13,
});
const destinations = [createMarkerState({ id: 'tokyo', position: destination.position })];`,
  explanation: {
    en: [
      'Move the camera to a destination with a one-second animation while using the same API for every provider.',
      'The destination is a MapCameraPosition that fixes both a coordinate and a zoom level, and the destinations array drops one marker there so the target is visible.',
      'The button calls mapViewState.moveCameraTo(destination, 1000), and the 1000 ms animation runs identically no matter which provider renders the map.',
    ],
    ja: [
      'すべてのプロバイダーで共通の API を使い、目的地まで1秒間のアニメーションでカメラを移動します。',
      'destination は座標とズームをまとめて指定する MapCameraPosition で、destinations 配列は目的地にマーカーを1つ置いて位置を示します。',
      'ボタンは mapViewState.moveCameraTo(destination, 1000) を呼び出し、どのプロバイダーが描画していても 1000ms のアニメーションが同じように再生されます。',
    ],
    'es-419': [
      'Mueve la cámara a un destino con una animación de un segundo mediante la misma API para todos los proveedores.',
      'El destination es un MapCameraPosition que fija a la vez una coordenada y un nivel de zoom, y el arreglo destinations coloca un marcador allí para que el objetivo sea visible.',
      'El botón llama a mapViewState.moveCameraTo(destination, 1000) y la animación de 1000 ms se reproduce igual sin importar qué proveedor dibuje el mapa.',
    ],
  },
};

export default doc;
