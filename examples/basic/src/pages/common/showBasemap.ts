import {
    VectorStyleSupportKey,
    type MapDesignTypeInterface,
    type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import { ArcGISDesign, ArcGISMapViewState } from '@mapconductor/react-for-arcgis';
import { AzureMapsDesign, AzureMapsViewState } from '@mapconductor/react-for-azuremaps';
import { CesiumDesign, CesiumMapViewState } from '@mapconductor/react-for-cesium';
// Import the state-only entry point. The full deck.gl barrel installs a
// versioned `globalThis.deck`; Mappls loads its own deck runtime and fails
// when it finds a different version already registered on the page.
import { DeckGLDesign, DeckGLMapViewState } from '@mapconductor/react-for-deckgl/state';
import { GoogleMapDesign, GoogleMapViewState } from '@mapconductor/react-for-googlemaps';
import { HereMapDesign, HereViewState } from '@mapconductor/react-for-here';
import { LeafletDesign, LeafletMapViewState } from '@mapconductor/react-for-leaflet';
import { LongdoDesign, LongdoViewState } from '@mapconductor/react-for-longdo';
import { MapboxDesign, MapboxViewState } from '@mapconductor/react-for-mapbox';
import { MapLibreDesign, MapLibreViewState } from '@mapconductor/react-for-maplibre';
import { MapTilerDesign, MapTilerViewState } from '@mapconductor/react-for-maptiler';
import { OpenLayersDesign, OpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import { TomTomDesign, TomTomViewState } from '@mapconductor/react-for-tomtom';

/**
 * Blanks the backend's own basemap, or restores it.
 *
 * Each provider says "draw nothing" with its own design value (`None`, or
 * Azure's `Blank`). MapKit and Mappls have none; there the opaque tiles cover
 * the basemap, which is still fetched for nobody.
 */
export function showBasemap(state: MapViewStateInterface<MapDesignTypeInterface<unknown>>, visible: boolean) {
    // A map that takes the style directly gets it *as* its design from the
    // layer; blanking first would only load one style to throw it away. Going
    // back to the provider's own basemap is still done here.
    if (!visible && state.serviceRegistry.has(VectorStyleSupportKey)) return;
    if (state instanceof MapLibreViewState) {
        state.mapDesignType = visible ? MapLibreDesign.OsmBrightJa : MapLibreDesign.None;
    } else if (state instanceof GoogleMapViewState) {
        // The 3D map has no "none" mode, and the same state class serves both.
        const map = state.getMapViewHolder()?.map as { tagName?: string } | undefined;
        if (map?.tagName === 'GMP-MAP-3D') return;
        state.mapDesignType = visible ? GoogleMapDesign.Normal : GoogleMapDesign.None;
    } else if (state instanceof ArcGISMapViewState) {
        state.mapDesignType = visible ? ArcGISDesign.OsmStandard : ArcGISDesign.None;
    } else if (state instanceof MapboxViewState) {
        state.mapDesignType = visible ? MapboxDesign.Streets : MapboxDesign.None;
    } else if (state instanceof MapTilerViewState) {
        state.mapDesignType = visible ? MapTilerDesign.Streets : MapTilerDesign.None;
    } else if (state instanceof TomTomViewState) {
        state.mapDesignType = visible ? TomTomDesign.Standard : TomTomDesign.None;
    } else if (state instanceof LongdoViewState) {
        state.mapDesignType = visible ? LongdoDesign.Normal : LongdoDesign.None;
    } else if (state instanceof HereViewState) {
        state.mapDesignType = visible ? HereMapDesign.NormalDay : HereMapDesign.None;
    } else if (state instanceof LeafletMapViewState) {
        state.mapDesignType = visible ? LeafletDesign.OpenStreetMap : LeafletDesign.None;
    } else if (state instanceof OpenLayersMapViewState) {
        state.mapDesignType = visible ? OpenLayersDesign.OpenStreetMap : OpenLayersDesign.None;
    } else if (state instanceof DeckGLMapViewState) {
        state.mapDesignType = visible ? DeckGLDesign.Standard : DeckGLDesign.None;
    } else if (state instanceof CesiumMapViewState) {
        state.mapDesignType = visible ? CesiumDesign.Default : CesiumDesign.None;
    } else if (state instanceof AzureMapsViewState) {
        state.mapDesignType = visible ? AzureMapsDesign.Road : AzureMapsDesign.Blank;
    }
}
