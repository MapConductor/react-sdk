import { useLocation, useNavigate } from 'react-router-dom';
import { getSamplePageLabel, resolveProviderForPage, SAMPLE_PAGES } from '../sampleRegistry';
import { parseSamplePath, samplePath } from '../app/appRouting';
import { getLanguageFromPath } from '../i18n';

export function PageNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { providerPath, page: activePage } = parseSamplePath(location.pathname);
  const provider = providerPath === 'camera-sync' ? 'maplibre' : providerPath;
  const language = getLanguageFromPath(location.pathname);

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
                const targetProvider = resolveProviderForPage(provider, page.id);
                navigate(samplePath(targetProvider, page.id, language));
                onNavigate?.();
              }}
            >
              <span>{getSamplePageLabel(page, language)}</span>
              {page.status === 'unsupported' ? <span className="sidebar-badge">TODO</span> : null}
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
