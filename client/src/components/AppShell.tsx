import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-paper/80 border-b border-ink/8">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-medium tracking-tight">
            Keep<span className="text-accent italic">sake</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/" active={pathname === '/'}>Notes</NavLink>
            <NavLink to="/archive" active={pathname === '/archive'}>Archive</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-ink/10"
              />
            )}
            <button
              onClick={logout}
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-full transition-colors ${
        active ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
