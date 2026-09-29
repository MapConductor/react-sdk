import { Fragment } from 'react';
import { DeckGLMapView, type DeckGLMapViewStateInterface } from '@mapconductor/react-for-deckgl';
import type { SingletonMapContent } from './types';

export default function DeckGLSingletonView({ state, content }: {
  state: DeckGLMapViewStateInterface;
  content: SingletonMapContent | null;
}) {
  return (
    <DeckGLMapView
      state={state}
      cameraRestriction={content?.cameraRestriction}
      onMapClick={content?.onMapClick}
      onCameraMoveStart={content?.onCameraMoveStart}
      onCameraMove={content?.onCameraMove}
      onCameraMoveEnd={content?.onCameraMoveEnd}
    >
      {content && <Fragment key={content.owner}>{content.children}</Fragment>}
    </DeckGLMapView>
  );
}
