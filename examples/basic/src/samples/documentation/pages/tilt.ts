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
    de: [
      'Die aktuelle Kameraposition kopieren, nur ihre Neigung ersetzen und die Änderung animieren.',
      'Der Neigungswert liegt im React-State; cameraPosition.copy({ tilt }) behält Mittelpunkt, Zoom und Ausrichtung bei und schreibt allein den Nickwinkel neu.',
      'Die Übergabe von 400 ms an moveCameraTo animiert die Änderung weich, und derselbe Aufruf gilt bei jedem Anbieter, der eine geneigte Ansicht unterstützt.',
    ],
    th: [
      'คัดลอกตำแหน่งกล้องปัจจุบัน เปลี่ยนเฉพาะค่าการเอียง แล้วทำแอนิเมชันให้การเปลี่ยนนั้น',
      'ค่าการเอียงเก็บอยู่ในสถานะของ React ส่วน cameraPosition.copy({ tilt }) คงจุดกึ่งกลาง ระดับซูม และทิศไว้ แล้วเขียนใหม่เฉพาะมุมก้มเงย',
      'การส่งค่า 400 มิลลิวินาทีให้ moveCameraTo ทำให้การเปลี่ยนแปลงลื่นไหล และการเรียกแบบเดียวกันนี้ใช้ได้กับผู้ให้บริการทุกเจ้าที่รองรับมุมมองแบบเอียง',
    ],
    hi: [
      'मौजूदा कैमरा स्थिति की नकल लें, सिर्फ़ उसका झुकाव बदलें, और उस बदलाव को एनिमेट करें।',
      'झुकाव का मान React स्टेट में रहता है; cameraPosition.copy({ tilt }) केंद्र, ज़ूम और दिशा वैसी ही रखता है और सिर्फ़ पिच दोबारा लिखता है।',
      'moveCameraTo को 400 ms देने से बदलाव सहजता से एनिमेट होता है, और यही कॉल हर उस प्रोवाइडर पर लागू होती है जो झुका हुआ दृश्य दे सकता है।',
    ],
  },
};

export default doc;
