import { useEffect } from 'react';
import * as THREE from 'three';
import {
  type GeoPointInterface,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type Offset,
} from '@mapconductor/js-sdk-core';
import { useMapReady } from '@mapconductor/js-sdk-react';

export function ThreeMapObject({
  mapViewState,
  position,
}: {
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
  position: GeoPointInterface;
}) {
  const isMapReady = useMapReady();

  useEffect(() => {
    if (!isMapReady) return;
    const holder = mapViewState.getMapViewHolder();
    if (!holder) return;

    // Render the overlay into the same frame `toScreenOffset` reports in — the
    // outer viewport (the position:relative wrapper), not `mapView` itself. For
    // MapLibre/Mapbox the two share bounds so this is a no-op, but HERE renders
    // its H.Map into a 200%×200% inner plane and projects geo points back into
    // the outer viewport, so attaching to `mapView` misplaces the object.
    const overlayHost = (holder.mapView.parentElement as HTMLElement | null) ?? holder.mapView;

    // Project into the OUTER viewport frame that `overlayHost` lives in. Most
    // providers' `toScreenOffset` already returns outer-viewport coords (for
    // MapLibre/Mapbox `mapView` IS the viewport; HERE/OpenLayers transform their
    // inner 200% plane back to the viewport). Leaflet is the exception: its
    // `toScreenOffset` returns INNER-plane coords and it exposes a separate
    // `toOuterScreenOffset` for screen-space overlays — use that when present so
    // the object lines up with the map on every provider.
    const projectToOuter = (pos: GeoPointInterface): Offset | Promise<Offset | null> | null => {
      const outerProject = (holder as { toOuterScreenOffset?: (p: GeoPointInterface) => Offset })
        .toOuterScreenOffset;
      return outerProject ? outerProject.call(holder, pos) : holder.toScreenOffset(pos);
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = 'three-map-overlay';
    overlayHost.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(-40, 80, 120);
    scene.add(light);

    const object = new THREE.Group();
    const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 7, 30, 24),
      pedestalMaterial,
    );
    pedestal.position.y = 15;
    object.add(pedestal);

    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.35,
      roughness: 0.25,
    });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(13, 4, 72, 12), knotMaterial);
    knot.position.y = 48;
    object.add(knot);
    scene.add(object);

    let width = 1;
    let height = 1;
    const resize = () => {
      width = Math.max(overlayHost.clientWidth, 1);
      height = Math.max(overlayHost.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.left = 0;
      camera.right = width;
      camera.top = height;
      camera.bottom = 0;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(overlayHost);
    resize();

    let disposed = false;
    let frame = 0;
    let projectionPending = false;
    const applyOffset = (offset: Offset | null) => {
      if (!offset || disposed) {
        object.visible = false;
        return;
      }
      object.visible = true;
      object.position.set(offset.x, height - offset.y, 0);
    };
    const animate = () => {
      knot.rotation.x += 0.012;
      knot.rotation.y += 0.018;
      const projected = projectToOuter(position);
      if (projected instanceof Promise) {
        if (!projectionPending) {
          projectionPending = true;
          projected.then(applyOffset).finally(() => {
            projectionPending = false;
          });
        }
      } else {
        applyOffset(projected);
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.remove();
      pedestal.geometry.dispose();
      pedestalMaterial.dispose();
      knot.geometry.dispose();
      knotMaterial.dispose();
      renderer.dispose();
    };
  }, [isMapReady, mapViewState, position]);

  return null;
}
