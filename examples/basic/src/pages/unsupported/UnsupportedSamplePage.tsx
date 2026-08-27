import { ControlPanel } from '../../components/ControlPanel';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n, type Phrase } from '../../samples/i18n';

export function UnsupportedSamplePage({ title }: { title: Phrase }) {
  const { t } = useSampleI18n();
  return (
    <MapViewContainer>
      <ControlPanel title={t(title)}>
        <p className="control-panel-note">
          {t(
            {
              en: 'This sample depends on an extension package that is not available in this React SDK workspace yet.',
              ja: 'このサンプルが必要とする拡張パッケージは、まだReact SDKワークスペースで利用できません。',
              'es-419': 'Este ejemplo depende de un paquete de extensión que aún no está disponible en este espacio de trabajo del React SDK.',
              de: 'Dieses Beispiel benötigt ein Erweiterungspaket, das in diesem React-SDK-Workspace noch nicht verfügbar ist.',
              th: 'ตัวอย่างนี้ต้องใช้แพ็กเกจส่วนขยายที่ยังไม่มีในเวิร์กสเปซ React SDK นี้',
              hi: 'यह सैंपल एक एक्सटेंशन पैकेज पर निर्भर है, जो इस React SDK वर्कस्पेस में अभी उपलब्ध नहीं है।',
            },
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
