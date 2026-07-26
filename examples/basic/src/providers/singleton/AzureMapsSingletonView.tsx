import { Fragment } from 'react';
import { AzureMapsMapView, type AzureMapsViewState } from '@mapconductor/react-for-azuremaps';
import '@mapconductor/react-for-azuremaps/style.css';
import type { SingletonMapContent } from './types';

export default function AzureMapsSingletonView({ state, content }: {
  state: AzureMapsViewState;
  content: SingletonMapContent | null;
}) {
  return (
    <AzureMapsMapView
      state={state}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </AzureMapsMapView>
  );
}
