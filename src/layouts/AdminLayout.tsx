import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-black mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <Link to="/admin" className="block hover:text-emerald-400 font-bold">Dashboard</Link>
          <Link to="/" className="block hover:text-emerald-400 font-bold">View Site</Link>
        </nav>
      </aside>
      <main className="flex-grow p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
