import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';

export function Layout() {
  const { user } = useAuthStore();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="antialiased min-h-screen flex flex-col md:flex-row bg-background text-on-background">
      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full py-8 px-6 z-40 w-64 bg-surface-container-low/80 backdrop-blur-md border-r border-white/20 shadow-sm">
        <div className="mb-12">
          <Link to="/dashboard" className="block">
            <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight">Dresync</h1>
          </Link>
          <p className="font-label-caps text-label-caps text-on-surface-variant mt-2 tracking-widest">Premium AI Styling</p>
        </div>
        
        <div className="flex-1 space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-4 p-3 transition-colors font-label-caps text-label-caps rounded-lg ${isActive ? 'bg-secondary-container/10 text-primary translate-x-1 transition-transform' : 'text-on-surface-variant hover:bg-secondary-container/5'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>dashboard</span>
            Dashboard
          </NavLink>
          <NavLink to="/wardrobe" className={({ isActive }) => `flex items-center gap-4 p-3 transition-colors font-label-caps text-label-caps rounded-lg ${isActive ? 'bg-secondary-container/10 text-primary translate-x-1 transition-transform' : 'text-on-surface-variant hover:bg-secondary-container/5'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>checkroom</span>
            Wardrobe
          </NavLink>
          <NavLink to="/planner" className={({ isActive }) => `flex items-center gap-4 p-3 transition-colors font-label-caps text-label-caps rounded-lg ${isActive ? 'bg-secondary-container/10 text-primary translate-x-1 transition-transform' : 'text-on-surface-variant hover:bg-secondary-container/5'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_month</span>
            Planner
          </NavLink>
          <NavLink to="/outfits/generate" className={({ isActive }) => `flex items-center gap-4 p-3 transition-colors font-label-caps text-label-caps rounded-lg ${isActive ? 'bg-secondary-container/10 text-primary translate-x-1 transition-transform' : 'text-on-surface-variant hover:bg-secondary-container/5'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>auto_awesome</span>
            Recommendations
          </NavLink>
          {/* Note: History and Favorites are mocked for now as per previous logic, linking them to dashboard or outfits */}
        </div>

        <div className="mt-auto space-y-2">
          <Link to="/outfits/generate" className="block w-full bg-primary text-on-primary font-button text-button py-3 rounded-lg mb-6 hover:opacity-90 transition-opacity text-center">
            Ask AI Stylist
          </Link>
          <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-4 p-3 transition-colors font-label-caps text-label-caps rounded-lg ${isActive ? 'bg-secondary-container/10 text-primary translate-x-1 transition-transform' : 'text-on-surface-variant hover:bg-secondary-container/5'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
            Settings
          </NavLink>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 w-full min-h-screen relative">
        {/* TopAppBar (Mobile & Global Header Elements) */}
        <header className="sticky top-0 z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 w-full bg-surface/70 backdrop-blur-md border-b border-white/20">
          <div className="md:hidden">
            <Link to="/dashboard">
              <h1 className="font-display-lg text-display-lg-mobile tracking-tight text-primary">Dresync</h1>
            </Link>
          </div>
          <div className="hidden md:block">
            {/* Spacer for desktop */}
            <span className="font-headline-sm text-headline-sm text-primary">Welcome</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className="text-primary hover:opacity-80 transition-opacity duration-300 scale-95 duration-200 ease-out" aria-label="Toggle theme">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button disabled title="Notifications (Coming Soon)" className="text-primary/50 cursor-not-allowed scale-95 transition-opacity duration-300">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
            </button>
            <Link to="/profile" className="ml-2 shrink-0">
              {user?.profile_image_url ? (
                 <img alt="User profile" className="w-10 h-10 rounded-full object-cover border border-outline-variant" src={user.profile_image_url} />
              ) : (
                <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container-high flex items-center justify-center font-headline-sm text-primary text-sm">
                  {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-margin-mobile md:p-margin-desktop pb-section-gap">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
