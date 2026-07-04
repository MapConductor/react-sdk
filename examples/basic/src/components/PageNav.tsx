import { useLocation, useNavigate } from 'react-router-dom';
import { SAMPLE_PAGES } from '../sampleRegistry';

export function PageNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const provider = pathParts[0] || 'maplibre';
  const activePage = pathParts[1] || 'map';

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Samples</div>
      {Array.from(new Set(SAMPLE_PAGES.map(page => page.group))).map(group => (
        <section className="sidebar-group" key={group}>
          <div className="sidebar-group-title">{group}</div>
          {SAMPLE_PAGES.filter(page => page.group === group).map(page => (
            <button
              key={page.id}
              className={[
                'sidebar-item',
                activePage === page.id ? 'active' : '',
                page.status === 'unsupported' ? 'unsupported' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => {
                navigate(`/${provider}/${page.id}${location.search}`);
                onNavigate?.();
              }}
            >
              <span>{page.label}</span>
              {page.status === 'unsupported' ? <span className="sidebar-badge">TODO</span> : null}
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
