import { useLocation, useNavigate } from 'react-router-dom';
import { getSamplePageLabel, resolveProviderForPage, SAMPLE_PAGES } from '../samples/sampleRegistry';
import { parseSamplePath, samplePath } from '../app/appRouting';
import { getLanguageFromPath } from '../samples/i18n';

export function PageNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { providerPath, page: activePage } = parseSamplePath(location.pathname);
  // camera-sync and hello-map are provider-less pages; fall back to a real
  // provider so links to other pages keep a valid provider segment.
  const provider = providerPath === 'camera-sync' || providerPath === 'hello-map'
    ? 'maplibre'
    : providerPath;
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
