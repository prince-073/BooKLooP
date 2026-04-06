import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, Library, Bell, User, PlusCircle, Heart, MessageSquare, HelpCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { OnboardingTour } from './OnboardingTour';

const Layout: React.FC = () => {
  const location = useLocation();
  // Messages page gets a full-height, no-padding layout
  const isMessages = location.pathname === '/messages';

  return (
    <div className="min-h-screen bg-surface flex flex-col paper-grain text-on-surface">
      <OnboardingTour />
      {/* Main Content Area */}
      <main className={cn(
        "flex-1 md:pl-28 lg:pl-72",
        isMessages ? "pb-16 md:pb-0 flex flex-col min-h-0" : "pb-24 md:pb-0 pt-4"
      )}>
        {isMessages ? (
          // Chat: full height, no inner padding container
          <div className="flex flex-col h-full" style={{ height: 'calc(100dvh - 4rem)', padding: '0.75rem' }}>
            <Outlet />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
            <Outlet />
          </div>
        )}
      </main>

      {/* Navigation - Mobile Bottom / Desktop Sidebar */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-2xl border-t border-white/60 shadow-[0_-8px_32px_rgba(30,27,75,0.05)]",
        "md:top-0 md:bottom-0 md:right-auto md:w-28 lg:w-72 md:border-t-0 md:border-r md:border-white/50 md:shadow-[8px_0_32px_rgba(30,27,75,0.05)]",
        "flex md:flex-col justify-around md:justify-start items-center md:items-stretch py-3 md:py-10"
      )}>
        {/* Logo - Desktop only */}
        <div className="hidden md:flex flex-col items-center lg:flex-row lg:items-center px-4 lg:px-8 mb-10 w-full">
          <img src="/android-chrome-192x192.png" alt="BookLoop" className="w-12 h-12 lg:w-14 lg:h-14 object-contain shadow-sm drop-shadow-sm rounded-xl lg:mr-3 shrink-0" />
          <div className="hidden lg:flex flex-col items-start justify-center pt-1 overflow-hidden">
             <span className="font-headline font-extrabold text-[1.4rem] text-on-surface tracking-tight leading-none mb-1">BookLoop</span>
             <span className="text-[0.55rem] font-bold uppercase tracking-widest text-on-surface-variant/70 whitespace-nowrap truncate w-full">Share Stories</span >
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar md:overflow-y-auto md:flex-col gap-2 md:gap-4 w-full px-4 lg:px-6 py-1 md:flex-1 md:pb-6">
          <NavItem to="/" icon={<Home size={26} strokeWidth={1.5} />} label="Home" />
          <NavItem to="/explore" icon={<Search size={26} strokeWidth={1.5} />} label="Explore" />
          <NavItem to="/add" icon={<PlusCircle size={26} strokeWidth={1.5} />} label="Add Book" className="md:hidden" />
          <NavItem to="/library" icon={<Library size={26} strokeWidth={1.5} />} label="Library" />
          <NavItem to="/saved" icon={<Heart size={26} strokeWidth={1.5} />} label="Wishlist" />
          <NavItem to="/messages" icon={<MessageSquare size={26} strokeWidth={1.5} />} label="Messages" />
          <NavItem to="/requests" icon={<Bell size={26} strokeWidth={1.5} />} label="Requests" />
          <NavItem to="/profile" icon={<User size={26} strokeWidth={1.5} />} label="Profile" />
          <NavItem to="/help" icon={<HelpCircle size={26} strokeWidth={1.5} />} label="Help" />
          <NavItem to="/about" icon={<Info size={26} strokeWidth={1.5} />} label="About" />
        </div>

        {/* Desktop Add Button */}
        <div className="hidden md:block mt-auto px-6">
          <NavLink
            to="/add"
            className={({ isActive }) => cn(
              "flex items-center justify-center lg:justify-start gap-4 w-full py-4 px-6 rounded-md transition-all duration-300 font-headline group",
              "bg-primary text-on-primary hover:bg-primary/90 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),_0_4px_12px_rgba(92,64,51,0.3)]",
              isActive && "ring-2 ring-primary ring-offset-2 ring-offset-surface"
            )}
          >
            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden lg:block font-bold text-lg tracking-wide">Add Book</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, className }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-5 py-3 lg:py-4 px-3 lg:px-5 rounded-xl transition-all duration-300 relative flex-shrink-0 min-w-[72px] border border-transparent",
        "text-on-surface-variant hover:bg-white/50 hover:border-white/60 hover:shadow-sm hover:text-on-surface font-headline",
        isActive && "bg-white/80 text-primary font-extrabold shadow-md border-white/80 backdrop-blur-md",
        className
      )}
    >
      <div className={cn("transition-transform duration-300", "group-hover:-translate-y-1")}>
        {icon}
      </div>
      <span className="text-[11px] md:text-xs lg:text-base tracking-wide mt-1 lg:mt-0">
        {label}
      </span>
    </NavLink>
  );
};

export default Layout;
