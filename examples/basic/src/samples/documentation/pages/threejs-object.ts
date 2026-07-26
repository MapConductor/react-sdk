import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `function ThreeMapObject({ mapViewState, position }) {
  const isMapReady = useMapReady();

  useEffect(() => {
    if (!isMapReady) return;
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
  }, [isMapReady, mapViewState, position]);

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
      'useMapReady holds the effect back until the map exists, then getMapViewHolder() returns a holder whose WebGL canvas is appended over the map.',
      'On each frame holder.toScreenOffset(position) converts the geographic coordinate into a pixel offset, so the 3D object stays pinned while the map moves — the same call on every provider.',
    ],
    ja: [
      '透明な Three.js の canvas を地図へ重ね、Provider 非依存の MapViewHolder.toScreenOffset() で立体オブジェクトを地理座標へ固定します。',
      'useMapReady が地図の準備が整うまで useEffect を待たせ、その後 getMapViewHolder() が返すホルダーの WebGL canvas を地図の上へ追加します。',
      '毎フレーム holder.toScreenOffset(position) が地理座標をピクセル座標へ変換するため、地図を動かしても立体オブジェクトが固定され、どのプロバイダーでも同じ呼び出しで動きます。',
    ],
    'es-419': [
      'Superpone un lienzo transparente de Three.js sobre el mapa y ancla su objeto 3D con la proyección MapViewHolder.toScreenOffset(), independiente del proveedor.',
      'useMapReady retiene el efecto hasta que el mapa existe, y luego getMapViewHolder() devuelve un holder cuyo lienzo WebGL se agrega sobre el mapa.',
      'En cada fotograma holder.toScreenOffset(position) convierte la coordenada geográfica en un desplazamiento en píxeles, de modo que el objeto 3D permanece fijo mientras el mapa se mueve, con la misma llamada en cada proveedor.',
    ],
  },
};

export default doc;
