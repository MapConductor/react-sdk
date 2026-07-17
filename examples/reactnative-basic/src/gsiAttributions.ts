import type { AttributionRule } from '@mapconductor/js-sdk-core';

export const GSI_ATTRIBUTION = '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>';
export const GSI_RELIEF_ATTRIBUTION = '海域部は海上保安庁海洋情報部の資料を使用して作成';
export const GEBCO_ATTRIBUTION = 'The bathymetric contours are derived from those contained within the GEBCO Digital Atlas, published by the BODC on behalf of IOC and IHO (2003) (<a href="https://www.gebco.net">https://www.gebco.net</a>)';
export const JAPAN_COAST_GUARD_ATTRIBUTION = '海上保安庁許可第292502号（水路業務法第25条に基づく類似刊行物）';
export const VMAP0_ATTRIBUTION = 'Shoreline data is derived from: United States. National Imagery and Mapping Agency. &quot;Vector Map Level 0 (VMAP0).&quot; Bethesda, MD: Denver, CO: The Agency; USGS Information Services, 1997.';

export const GSI_STANDARD_ATTRIBUTION_RULES: readonly AttributionRule[] = [
  { attribution: GSI_ATTRIBUTION },
  { attribution: GEBCO_ATTRIBUTION, minZoom: 5, maxZoom: 8 },
  { attribution: JAPAN_COAST_GUARD_ATTRIBUTION, minZoom: 5, maxZoom: 8 },
  { attribution: VMAP0_ATTRIBUTION, minZoom: 5, maxZoom: 8 },
];

export const GSI_RELIEF_ATTRIBUTION_RULES: readonly AttributionRule[] = [
  { attribution: GSI_ATTRIBUTION },
  { attribution: GSI_RELIEF_ATTRIBUTION },
];
