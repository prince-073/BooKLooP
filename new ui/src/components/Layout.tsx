import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Search, Library, Bell, User, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col paper-grain">
      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 md:pl-20 lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Navigation - Mobile Bottom / Desktop Sidebar */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-outline-variant",
        "md:top-0 md:bottom-0 md:right-auto md:w-20 lg:w-64 md:border-t-0 md:border-r",
        "flex md:flex-col justify-around md:justify-start items-center md:items-stretch py-2 md:py-8"
      )}>
        {/* Logo - Desktop only */}
        <div className="hidden md:flex items-center px-6 mb-12">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary font-headline font-bold text-xl">
            C
          </div>
          <span className="hidden lg:block ml-3 font-headline font-bold text-xl text-primary">The Curator</span>
        </div>

        <div className="flex md:flex-col gap-1 md:gap-4 w-full px-2 md:px-4">
          <NavItem to="/" icon={<Home size={24} />} label="Home" />
          <NavItem to="/explore" icon={<Search size={24} />} label="Explore" />
          <NavItem to="/add" icon={<PlusCircle size={24} />} label="Curate" className="md:hidden" />
          <NavItem to="/library" icon={<Library size={24} />} label="Library" />
          <NavItem to="/activity" icon={<Bell size={24} />} label="Activity" />
          <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
        </div>

        {/* Desktop Add Button */}
        <div className="hidden md:block mt-auto px-4">
          <NavLink
            to="/add"
            className={({ isActive }) => cn(
              "flex items-center justify-center lg:justify-start gap-3 w-full py-3 px-4 rounded-2xl transition-all duration-200",
              "bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20",
              isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <PlusCircle size={24} />
            <span className="hidden lg:block font-medium">Curate Book</span>
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
        "flex flex-col md:flex-row items-center gap-1 md:gap-4 py-2 md:py-3 px-3 md:px-4 rounded-2xl transition-all duration-200",
        "text-on-surface-variant hover:bg-surface-container-high",
        isActive && "bg-primary-container text-on-primary-container font-medium",
        className
      )}
    >
      <div className={cn("transition-transform duration-200", "group-hover:scale-110")}>
        {icon}
      </div>
      <span className="text-[10px] md:text-sm lg:text-base font-medium md:block">
        {label}
      </span>
    </NavLink>
  );
};

export default Layout;
