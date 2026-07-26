import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `mapViewState.moveCameraTo(
  mapViewState.cameraPosition.copy({ tilt }),
  400,
);

<MapViewContainer state={mapViewState} />`,
  state: `const [tilt, setTilt] = useState(0);`,
  explanation: {
    en: [
      'Copy the current camera position, replace only its tilt, and animate the update.',
      'The tilt value lives in React state; cameraPosition.copy({ tilt }) preserves the center, zoom and bearing and rewrites only the pitch.',
      'Passing 400 ms to moveCameraTo animates the change smoothly, and the identical call applies on every provider that supports a tilted view.',
    ],
    ja: [
      '現在のカメラ位置をコピーし、傾きだけを変更してアニメーション付きで反映します。',
      'tilt は React の state で保持し、cameraPosition.copy({ tilt }) は中心・ズーム・方位はそのままに傾きだけを書き換えます。',
      'moveCameraTo に 400ms を渡すと傾きの変化が滑らかにアニメーションし、傾き表示に対応するどのプロバイダーでも同じ呼び出しが使えます。',
    ],
    'es-419': [
      'Copia la posición actual de la cámara, cambia solo la inclinación y anima la actualización.',
      'El valor de inclinación vive en el estado de React; cameraPosition.copy({ tilt }) conserva el centro, el zoom y la orientación y reescribe solo el ángulo.',
      'Pasar 400 ms a moveCameraTo anima el cambio con suavidad, y la misma llamada funciona en cada proveedor que admite una vista inclinada.',
    ],
  },
};

export default doc;
