import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `function ThreeMapObject({ mapViewState, position }) {
  const isMapLoaded = useMapLoaded();

  useEffect(() => {
    if (!isMapLoaded) return;
    const holder = mapViewState.getMapViewHolder();
    if (!holder) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    camera.position.z = 200;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const width = holder.mapView.clientWidth;
    const height = holder.mapView.clientHeight;
    renderer.setSize(width, height);
    camera.right = width;
    camera.top = height;
    camera.updateProjectionMatrix();
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    holder.mapView.appendChild(renderer.domElement);

    const object = new THREE.Mesh(
      new THREE.TorusKnotGeometry(13, 4),
      new THREE.MeshNormalMaterial(),
    );
    scene.add(object);

    let frame = 0;
    const draw = () => {
      const offset = holder.toScreenOffset(position);
      if (offset && !(offset instanceof Promise)) {
        object.position.set(offset.x, height - offset.y, 0);
      }
      object.rotation.y += 0.02;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.remove();
      renderer.dispose();
    };
  }, [isMapLoaded, mapViewState, position]);

  return null;
}

<MapViewContainer state={mapViewState}>
  <ThreeMapObject mapViewState={mapViewState} position={position} />
</MapViewContainer>`,
  state: `const position = useMemo(() => createGeoPoint({
  latitude: 35.6812,
  longitude: 139.7671,
}), []);`,
  explanation: {
    en: [
      'Render a transparent Three.js canvas over the map and anchor its 3D object with the provider-independent MapViewHolder.toScreenOffset() projection.',
      'useMapLoaded holds the effect back until the map exists, then getMapViewHolder() returns a holder whose WebGL canvas is appended over the map.',
      'On each frame holder.toScreenOffset(position) converts the geographic coordinate into a pixel offset, so the 3D object stays pinned while the map moves — the same call on every provider.',
    ],
    ja: [
      '透明な Three.js の canvas を地図へ重ね、Provider 非依存の MapViewHolder.toScreenOffset() で立体オブジェクトを地理座標へ固定します。',
      'useMapLoaded が地図の準備が整うまで useEffect を待たせ、その後 getMapViewHolder() が返すホルダーの WebGL canvas を地図の上へ追加します。',
      '毎フレーム holder.toScreenOffset(position) が地理座標をピクセル座標へ変換するため、地図を動かしても立体オブジェクトが固定され、どのプロバイダーでも同じ呼び出しで動きます。',
    ],
    'es-419': [
      'Superpone un lienzo transparente de Three.js sobre el mapa y ancla su objeto 3D con la proyección MapViewHolder.toScreenOffset(), independiente del proveedor.',
      'useMapLoaded retiene el efecto hasta que el mapa existe, y luego getMapViewHolder() devuelve un holder cuyo lienzo WebGL se agrega sobre el mapa.',
      'En cada fotograma holder.toScreenOffset(position) convierte la coordenada geográfica en un desplazamiento en píxeles, de modo que el objeto 3D permanece fijo mientras el mapa se mueve, con la misma llamada en cada proveedor.',
    ],
    de: [
      'Eine durchsichtige Three.js-Leinwand über die Karte legen und ihr 3D-Objekt mit der anbieterunabhängigen Projektion MapViewHolder.toScreenOffset() verankern.',
      'useMapLoaded hält den Effekt zurück, bis die Karte existiert; dann liefert getMapViewHolder() einen Holder, dessen WebGL-Canvas über der Karte eingehängt wird.',
      'In jedem Bild wandelt holder.toScreenOffset(position) die geografische Koordinate in einen Pixelversatz um, sodass das 3D-Objekt beim Bewegen der Karte an seinem Ort bleibt — derselbe Aufruf bei jedem Anbieter.',
    ],
    th: [
      'วางแคนวาส Three.js แบบโปร่งใสไว้เหนือแผนที่ และตรึงอ็อบเจกต์ 3D ด้วยการฉาย MapViewHolder.toScreenOffset() ที่ไม่ผูกกับผู้ให้บริการ',
      'useMapLoaded หน่วงเอฟเฟกต์ไว้จนกว่าแผนที่จะมีอยู่จริง จากนั้น getMapViewHolder() จะคืนโฮลเดอร์ที่มีแคนวาส WebGL ต่อทับอยู่เหนือแผนที่',
      'ในทุกเฟรม holder.toScreenOffset(position) แปลงพิกัดภูมิศาสตร์เป็นออฟเซ็ตพิกเซล อ็อบเจกต์ 3D จึงตรึงอยู่กับที่ขณะแผนที่เลื่อน โดยเรียกแบบเดียวกันบนผู้ให้บริการทุกเจ้า',
    ],
    hi: [
      'मैप के ऊपर एक पारदर्शी Three.js कैनवास रेंडर करें, और उसके 3D ऑब्जेक्ट को प्रोवाइडर-निरपेक्ष MapViewHolder.toScreenOffset() प्रोजेक्शन से बाँधें।',
      'useMapLoaded इफ़ेक्ट को तब तक रोके रखता है जब तक मैप मौजूद न हो; फिर getMapViewHolder() एक होल्डर देता है, जिसका WebGL कैनवास मैप के ऊपर जोड़ दिया जाता है।',
      'हर फ़्रेम पर holder.toScreenOffset(position) भौगोलिक निर्देशांक को पिक्सेल ऑफ़सेट में बदलता है, इसलिए मैप हिलने पर भी 3D ऑब्जेक्ट अपनी जगह टिका रहता है — वही कॉल हर प्रोवाइडर पर।',
    ],
  },
};

export default doc;
