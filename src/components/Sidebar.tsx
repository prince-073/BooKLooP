import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Library,
  ArrowLeftRight,
  MessageSquare,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getCurrentUser } from '../lib/auth';
import { getAvatarUrl } from '../lib/media';
import { useLayoutShell } from '../context/LayoutContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Browse Books', path: '/browse' },
  { icon: PlusCircle, label: 'Add Book', path: '/add' },
  { icon: Library, label: 'My Books', path: '/my-books' },
  { icon: ArrowLeftRight, label: 'Requests', path: '/requests' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
];

const BOTTOM_NAV = [
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const layout = useLayoutShell();
  const open = layout?.sidebarOpen ?? false;
  const closeMobile = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      layout?.setSidebarOpen(false);
    }
  };

  const currentUser = getCurrentUser();
  const displayName = currentUser?.name || 'Guest User';
  const courseYear =
    currentUser?.course && currentUser?.year
      ? `${currentUser.course} '${String(currentUser.year).slice(-2)}`
      : currentUser?.course || 'Course N/A';
  const avatar = getAvatarUrl({
    name: currentUser?.name,
    email: currentUser?.email,
    id: currentUser?.id,
    avatarUrl: currentUser?.avatarUrl,
  });

  return (
    <aside
      className={cn(
        'h-screen w-64 max-w-[85vw] fixed left-0 top-0 border-r border-primary/10 bg-surface-container flex flex-col p-4 gap-2 z-50 transition-transform duration-300 ease-out',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <div className="px-4 py-8 mb-4 flex justify-center">
        <img src="/android-chrome-512x512.png" alt="BookLoop" className="w-[160px] h-auto object-contain drop-shadow-md rounded-xl" />
      </div>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-lg group',
                isActive && 'text-on-surface bg-primary/5 border-l-4 border-primary rounded-l-none'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-primary/10 pt-4">
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-lg',
                isActive && 'text-on-surface bg-primary/5 border-l-4 border-primary rounded-l-none'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}

        <div className="mt-4 p-4 bg-surface-container-lowest rounded-xl border border-primary/10">
          <div className="flex items-center gap-3 min-w-0">
            <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-on-surface truncate">{displayName}</span>
              <span className="text-[10px] text-on-surface-variant truncate">{courseYear}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
