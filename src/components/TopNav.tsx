import React, { useEffect, useState } from 'react';
import { Search, Bell, ShoppingCart, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearToken, getCurrentUser, getToken } from '../lib/auth';
import { getAvatarUrl } from '../lib/media';
import { useLayoutShell } from '../context/LayoutContext';

export function TopNav() {
  const navigate = useNavigate();
  const layout = useLayoutShell();
  const [hasToken, setHasToken] = useState(false);
  const currentUser = getCurrentUser();
  const displayName = currentUser?.name || 'Profile';
  const avatar = getAvatarUrl({
    name: currentUser?.name,
    email: currentUser?.email,
    id: currentUser?.id,
    avatarUrl: currentUser?.avatarUrl,
  });

  useEffect(() => {
    setHasToken(Boolean(getToken()));
  }, []);

  function handleLogout() {
    clearToken();
    setHasToken(false);
    navigate('/login');
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 z-40 flex items-center justify-between gap-3 pl-14 pr-4 md:px-8 bg-surface/60 backdrop-blur-xl border-b border-primary/10">
      <button
        type="button"
        className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
        aria-label="Open menu"
        onClick={() => layout?.toggleSidebar()}
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-4 flex-1 max-w-xl min-w-0">
        <div className="relative w-full group min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 transition-colors group-focus-within:text-on-surface pointer-events-none" />
          <input
            type="text"
            placeholder="Search titles, authors..."
            className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <button type="button" className="text-on-surface-variant hover:text-primary transition-colors relative hidden sm:block" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        <button type="button" className="text-on-surface-variant hover:text-primary transition-colors hidden sm:block" aria-label="Cart">
          <ShoppingCart className="w-5 h-5" />
        </button>

        {hasToken && (
          <button
            type="button"
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}

        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/15 ring-2 ring-primary/10 shrink-0">
          <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
