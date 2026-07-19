import type { MutableRefObject } from 'react';
import type { MapCameraPosition } from '@mapconductor/js-sdk-core';
import { PROGRAMMATIC_TTL_MS } from './cameraSyncData';
import type { PairedFlyToState, ProgrammaticMoveState } from './types';

function cameraKey(camera: MapCameraPosition): number {
  const latE5 = Math.trunc(camera.position.latitude * 1e5);
  const lonE5 = Math.trunc(camera.position.longitude * 1e5);
  const zoom100 = Math.trunc(camera.zoom * 100);
  const bearing10 = Math.trunc(camera.bearing * 10);
  return (((latE5 * 31 + lonE5) * 31 + zoom100) * 31 + bearing10);
}

function bearingDeltaDeg(a: number, b: number): number {
  const d = ((a - b) % 360 + 360) % 360;
  return d > 180 ? 360 - d : d;
}

function isCloseToTarget(camera: MapCameraPosition, target: MapCameraPosition): boolean {
  return (
    Math.abs(camera.position.latitude - target.position.latitude) < 0.0012 &&
    Math.abs(camera.position.longitude - target.position.longitude) < 0.0012 &&
    Math.abs(camera.zoom - target.zoom) < 0.75 &&
    bearingDeltaDeg(camera.bearing, target.bearing) < 12 &&
    Math.abs(camera.tilt - target.tilt) < 6
  );
}

export function markProgrammaticMove(
  ref: MutableRefObject<ProgrammaticMoveState>,
  target: MapCameraPosition,
  nowMs: number,
  ttlMs = PROGRAMMATIC_TTL_MS,
) {
  ref.current = {
    key: cameraKey(target),
    target,
    sinceMs: nowMs,
    untilMs: nowMs + ttlMs,
  };
}

export function clearProgrammaticMove(ref: MutableRefObject<ProgrammaticMoveState>) {
  ref.current = { key: null, target: null, sinceMs: 0, untilMs: 0 };
}

export function clearPairedFlyTo(ref: MutableRefObject<PairedFlyToState>) {
  ref.current = { active: false, untilMs: 0, leftEnded: false, rightEnded: false };
}

export function isProgrammaticMove(
  ref: MutableRefObject<ProgrammaticMoveState>,
  camera: MapCameraPosition,
  nowMs: number,
): boolean {
  const state = ref.current;
  if (state.key == null || nowMs > state.untilMs) return false;
  if (cameraKey(camera) === state.key) return true;
  return state.target ? isCloseToTarget(camera, state.target) : false;
}
