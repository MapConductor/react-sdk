import { useState, useCallback } from 'react';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';
import { useCamera } from '@mapconductor/js-sdk-react';

/**
 * Custom hook for handling map navigation with loading state
 */
export function useNavigation() {
  const { moveCamera } = useCamera();
  const [isNavigating, setIsNavigating] = useState(false);

  const flyToLocation = useCallback(
    async (lat: number, lng: number) => {
      setIsNavigating(true);
      try {
        await moveCamera(createMapCameraPosition({
          position: createGeoPoint({ latitude: lat, longitude: lng }),
          zoom: 10,
        }));
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsNavigating(false);
      }
    },
    [moveCamera]
  );

  return {
    flyToLocation,
    isNavigating,
  };
}
