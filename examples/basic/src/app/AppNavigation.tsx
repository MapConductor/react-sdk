import { PageNav } from '../components/PageNav';

export function AppNavigation({ menuOpen, sidebarOpen, onCloseMenu, onToggleSidebar }: {
  menuOpen: boolean;
  sidebarOpen: boolean;
  onCloseMenu(): void;
  onToggleSidebar(): void;
}) {
  return <>
    <div className={`desktop-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      {sidebarOpen && <PageNav />}
      <button type="button" className="sidebar-toggle" aria-label={`${sidebarOpen ? 'Close' : 'Open'} samples sidebar`} aria-expanded={sidebarOpen} onClick={onToggleSidebar}>
        {sidebarOpen ? '‹' : '›'}
      </button>
    </div>
    <div className={`mobile-menu-scrim ${menuOpen ? 'open' : ''}`} onClick={onCloseMenu} />
    <div className={`mobile-menu-drawer ${menuOpen ? 'open' : ''}`}><PageNav onNavigate={onCloseMenu} /></div>
  </>;
}
