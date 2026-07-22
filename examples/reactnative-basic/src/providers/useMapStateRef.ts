import { useCallback, useRef } from 'react';
import type { CommonMapViewState } from './types';

/**
 * Captures the active MapViewState produced inside MapViewContainer so a page
 * can drive the map imperatively (moveCameraTo, mapDesignType, ...).
 *
 * The container mounts a provider-specific view and reports its state via
 * `onStateReady`; switching providers remounts the view and reports the new
 * state, so `stateRef.current` always points at the live map.
 */
export function useMapStateRef() {
  const stateRef = useRef<CommonMapViewState | null>(null);
  const onStateReady = useCallback((state: CommonMapViewState) => {
    stateRef.current = state;
  }, []);
  return { stateRef, onStateReady };
}
