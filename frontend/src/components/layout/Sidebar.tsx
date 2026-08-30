import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/wardrobe', icon: 'checkroom', label: 'My Wardrobe' },
  { to: '/planner', icon: 'calendar_month', label: 'Planner' },
  { to: '/outfits/generate', icon: 'auto_awesome', label: 'Recommendations' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/favorites', icon: 'bookmark', label: 'Favorites' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="desktop-sidebar hidden md-flex flex-col fixed left-0 top-0 h-full z-40 bg-surface-container-low border-r border-outline-variant">
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="block">
          <h1 className="font-display-lg text-primary tracking-tight" style={{ fontSize: '32px' }}>Dresync</h1>
        </NavLink>
        <p className="font-label-caps text-on-surface-variant mt-2 tracking-widest">Premium AI Styling</p>
      </div>

      <div className="sidebar-nav flex-1 flex-col space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link font-label-caps text-on-surface-variant p-3 rounded-lg flex items-center gap-4 transition-colors ${isActive ? 'active-nav-link' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer space-y-2 mt-auto">
        <NavLink to="/outfits/generate" className="w-full bg-primary text-on-primary font-button py-3 rounded-lg mb-6 hover-opacity flex justify-center items-center">
          Ask AI Stylist
        </NavLink>
        
        <NavLink to="/profile" className="nav-link font-label-caps text-primary p-3 rounded-lg flex items-center gap-4 transition-colors bg-secondary-container-alpha">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          Settings
        </NavLink>
        
        <button onClick={handleLogout} className="nav-link font-label-caps text-on-surface-variant p-3 rounded-lg flex items-center gap-4 transition-colors w-full">
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
