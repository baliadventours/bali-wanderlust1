import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { Compass, User, LogOut, Menu, X, LayoutDashboard, Calendar, Settings, Shield } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-bottom border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Compass className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">TOUR<span className="text-emerald-600">SPHERE</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/tours" className="font-bold text-slate-600 hover:text-emerald-600 transition-colors">Expeditions</Link>
            <Link to="/blog" className="font-bold text-slate-600 hover:text-emerald-600 transition-colors">Journal</Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="font-bold text-slate-600 hover:text-emerald-600">Sign In</Link>
                <Link to="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md">Join Now</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Compass className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter">TOURSPHERE</span>
            </div>
            <p className="text-slate-400 font-medium">Redefining adventure travel through curated premium experiences and sustainable exploration.</p>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs text-emerald-500">Company</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/impact" className="hover:text-white transition-colors">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs text-emerald-500">Support</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/safety" className="hover:text-white transition-colors">Safety Info</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase tracking-widest text-xs text-emerald-500">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Get travel inspiration delivered to your inbox.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-emerald-500" />
              <button className="bg-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">© 2026 TourSphere SaaS. All rights reserved.</p>
          <div className="flex gap-6 text-slate-500 text-sm font-medium">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Calendar, label: 'My Bookings', path: '/dashboard/bookings' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const adminItems = [
    { icon: Shield, label: 'Admin Panel', path: '/admin' },
    { icon: Compass, label: 'Manage Tours', path: '/admin/tours' },
    { icon: Calendar, label: 'All Bookings', path: '/admin/bookings' },
    { icon: User, label: 'User Management', path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Compass className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">TOUR<span className="text-emerald-600">SPHERE</span></span>
          </Link>
        </div>

        <div className="flex-grow p-6 space-y-8 overflow-y-auto">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Menu</h4>
            <nav className="space-y-1">
              {menuItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Administration</h4>
              <nav className="space-y-1">
                {adminItems.map(item => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black">
              {user?.name?.[0] || user?.email?.[0]}
            </div>
            <div className="flex-grow min-w-0">
              <div className="font-bold text-slate-900 truncate">{user?.name || 'User'}</div>
              <div className="text-xs font-medium text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-900">Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
