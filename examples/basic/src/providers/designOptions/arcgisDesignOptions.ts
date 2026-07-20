import { ArcGISDesign } from '@mapconductor/react-for-arcgis';
import type { MapDesignOption } from './types';

export const ARCGIS_DESIGNS: MapDesignOption[] = [
  { label: 'Streets', design: ArcGISDesign.Streets },
  { label: 'Imagery', design: ArcGISDesign.Imagery },
  { label: 'Imagery Labels', design: ArcGISDesign.ImageryLabels },
  { label: 'Topographic', design: ArcGISDesign.Topographic },
  { label: 'Light Gray', design: ArcGISDesign.LightGray },
  { label: 'Dark Gray', design: ArcGISDesign.DarkGray },
  { label: 'Oceans', design: ArcGISDesign.Oceans },
  { label: 'Navigation', design: ArcGISDesign.Navigation },
  { label: 'OpenStreetMap', design: ArcGISDesign.OsmStandard },
];
