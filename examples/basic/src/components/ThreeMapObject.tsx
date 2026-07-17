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

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = 'three-map-overlay';
    holder.mapView.appendChild(renderer.domElement);

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
      width = Math.max(holder.mapView.clientWidth, 1);
      height = Math.max(holder.mapView.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.left = 0;
      camera.right = width;
      camera.top = height;
      camera.bottom = 0;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(holder.mapView);
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
      const projected = holder.toScreenOffset(position);
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
