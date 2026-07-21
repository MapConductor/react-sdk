import { Fragment, useMemo } from 'react';
import { HereMapView2D, type HereViewState } from '@mapconductor/react-for-here';
import type { SingletonMapContent } from './types';

export default function HereSingletonView({ state, content }: {
  state: HereViewState;
  content: SingletonMapContent | null;
}) {
  // HERE Maps API for JavaScript is loaded from CDN (see index.html); the
  // platform must be created with the host page's own credentials. Created
  // once here since this component, once mounted, is never unmounted.
  const platform = useMemo(
    () => new H.service.Platform({ apikey: import.meta.env.VITE_HERE_API_KEY }),
    [],
  );

  return (
    <HereMapView2D
      state={state}
      platform={platform}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </HereMapView2D>
  );
}
