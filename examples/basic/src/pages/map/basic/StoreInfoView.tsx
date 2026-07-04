import { type StoreInfo } from '../../../data/storeData';
export function StoreInfoView({ info }: { info: StoreInfo }) {
  const openDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(info.address)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ minWidth: 220, maxWidth: 280, color: '#111827' }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{info.name}</div>
      <div style={{ fontSize: 13, lineHeight: 1.35, marginBottom: 8 }}>{info.address}</div>
      {(info.instore || info.driveThrough) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, marginBottom: 8 }}>
          {info.instore && <span>● In store eating</span>}
          {info.driveThrough && <span>● Drive Through</span>}
        </div>
      )}
      <button
        type="button"
        onClick={openDirections}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          border: 0,
          borderRadius: 16,
          padding: '8px 12px',
          background: '#f5f5f5',
          color: '#111827',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#111827', display: 'inline-block' }} />
        Get Directions
      </button>
    </div>
  );
}