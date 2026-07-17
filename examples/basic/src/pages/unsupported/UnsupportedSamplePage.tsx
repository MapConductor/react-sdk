import { ControlPanel } from '../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';
import { useSampleI18n } from '../../i18n';

export function UnsupportedSamplePage({ title, titleJa = title }: { title: string; titleJa?: string }) {
  const { t } = useSampleI18n();
  const mapViewState = useSampleMapViewState();
  return (
    <MapViewContainer state={mapViewState}>
      <ControlPanel title={t(title, titleJa)}>
        <p className="control-panel-note">
          {t(
            'This sample depends on an extension package that is not available in this React SDK workspace yet.',
            'このサンプルが必要とする拡張パッケージは、まだReact SDKワークスペースで利用できません。',
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
