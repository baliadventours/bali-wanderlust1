
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut, LayoutDashboard, Calendar, Map, Settings, Menu, X, ShieldCheck, Users, Tags, Globe, ListTodo, Shield, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { LocalePicker } from '../shared/LocalePicker';
import { useTranslation } from 'react-i18next';

export const PublicLayout: React.FC = () => {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <div className="w-8 h-8 bg-emerald-600 rounded-[10px] flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <Compass className="w-5 h-5" />
              </div>
              <span className="tracking-tight">TourSphere</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/tours" className="text-sm text-slate-600 hover:text-emerald-600 font-bold transition-colors">{t('common.explore')}</Link>
              <Link to="/blog" className="text-sm text-slate-600 hover:text-emerald-600 font-bold transition-colors">Journal</Link>
              <div className="h-4 w-px bg-slate-200" />
              <LocalePicker />
              {user ? (
                <Link to="/dashboard" className="bg-slate-900 text-white px-5 py-2 rounded-[10px] text-sm font-bold hover:bg-emerald-600 transition shadow-sm">
                  {t('common.dashboard')}
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm text-slate-600 hover:text-emerald-600 font-bold transition-colors">{t('common.login')}</Link>
                  <Link to="/register" className="bg-emerald-600 text-white px-5 py-2 rounded-[10px] text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
                    {t('common.signup')}
                  </Link>
                </div>
              )}
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
            <Link to="/tours" className="block font-bold text-slate-900" onClick={() => setIsMenuOpen(false)}>Expeditions</Link>
            <Link to="/blog" className="block font-bold text-slate-900" onClick={() => setIsMenuOpen(false)}>Journal</Link>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
               {!user ? (
                 <>
                  <Link to="/login" className="text-slate-600 font-bold py-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="bg-emerald-600 text-white px-6 py-3 rounded-[10px] font-bold text-center" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                 </>
               ) : (
                 <Link to="/dashboard" className="bg-slate-900 text-white px-6 py-3 rounded-[10px] font-bold text-center" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
               )}
            </div>
          </div>
        )}
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="w-8 h-8 bg-emerald-600 rounded-[10px] flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span>TourSphere</span>
            </Link>
            <p className="max-w-sm text-slate-500 text-sm leading-relaxed">
              We curate world-class adventures for the modern explorer. Experience life untamed with our expert-led global expeditions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Explore</h4>
            <ul className="space-y-3 font-bold text-xs">
              <li><Link to="/tours" className="hover:text-emerald-400">All Expeditions</Link></li>
              <li><Link to="/blog" className="hover:text-emerald-400">Travel Journal</Link></li>
              <li><Link to="/destinations" className="hover:text-emerald-400">Destinations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Platform</h4>
            <ul className="space-y-3 font-bold text-xs">
              <li><Link to="/admin" className="hover:text-emerald-400">Admin Panel</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400">Host a Tour</Link></li>
              <li><Link to="/support" className="hover:text-emerald-400">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">&copy; 2024 TourSphere. Modernized Management.</p>
        </div>
      </footer>
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const menuItems = [
    { label: 'Intelligence', path: '/admin', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'My Bookings', path: '/dashboard/bookings', icon: Calendar, roles: ['customer'] },
    { type: 'divider', roles: ['admin', 'editor'] },
    { label: 'Inventory', path: '/admin/tours', icon: Map, roles: ['admin', 'editor'] },
    { label: 'Journal', path: '/admin/blog', icon: BookOpen, roles: ['admin', 'editor'] },
    { label: 'Hubs', path: '/admin/destinations', icon: Globe, roles: ['admin', 'editor'] },
    { label: 'Taxonomy', path: '/admin/categories', icon: Tags, roles: ['admin', 'editor'] },
    { label: 'Metrics', path: '/admin/facts', icon: ListTodo, roles: ['admin', 'editor'] },
    { label: 'Transactions', path: '/admin/bookings', icon: ShieldCheck, roles: ['admin', 'editor'] },
    { label: 'Authorities', path: '/admin/users', icon: Users, roles: ['admin'] },
    { label: 'Account Settings', path: '/dashboard/settings', icon: Settings, roles: ['customer', 'admin', 'editor'] },
  ];

  const filteredMenu = menuItems.filter(item => profile && (item.roles ? item.roles.includes(profile.role) : true));

  const renderMenuLinks = () => (
    <>
      {filteredMenu.map((item, idx) => {
        if (item.type === 'divider') return <div key={idx} className="h-px bg-slate-100 my-4" />;
        return (
          <Link
            key={item.path}
            to={item.path!}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 rounded-[10px] transition font-bold text-xs"
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
             <div className="w-7 h-7 bg-emerald-600 rounded-[10px] flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
            <span>TourSphere</span>
          </Link>
        </div>
        <nav className="flex-grow px-4 space-y-1 overflow-y-auto no-scrollbar pb-10">
          {renderMenuLinks()}
        </nav>
        <div className="p-4 border-t border-slate-50">
          <div className="mb-4 px-2">
             <LocalePicker />
          </div>
          <div className="bg-slate-900 rounded-[10px] p-4 flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-[8px] bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate flex-grow">
              <p className="text-xs font-bold text-white truncate">{profile?.full_name}</p>
              <div className="flex items-center gap-1">
                <Shield className={`w-2 h-2 ${profile?.role === 'admin' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-[10px] transition font-bold text-xs">
            <LogOut className="w-4 h-4" />
            {t('common.logout')}
          </button>
        </div>
      </aside>
      <div className="flex-grow flex flex-col min-w-0">
        <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-7 h-7 bg-emerald-600 rounded-[10px] flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <span>TourSphere</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-[10px] text-slate-600 hover:bg-slate-100"
            aria-label="Toggle sidebar menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setIsMobileMenuOpen(false)} />}

        <aside className={`md:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white border-r border-slate-100 z-50 transform transition-transform duration-200 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-900">Menu</span>
            <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-[10px] text-slate-600 hover:bg-slate-100" aria-label="Close sidebar menu">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto">
            {renderMenuLinks()}
          </nav>
          <div className="p-4 border-t border-slate-50">
            <div className="mb-4 px-2">
              <LocalePicker />
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-[10px] transition font-bold text-xs">
              <LogOut className="w-4 h-4" />
              {t('common.logout')}
            </button>
          </div>
        </aside>

      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
      </div>
    </div>
  );
};
