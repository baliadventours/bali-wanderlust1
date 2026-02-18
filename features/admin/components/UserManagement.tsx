
import React from 'react';
import { useAdminUsers, useUpdateUserRole } from '../hooks/useAdminData';
import { useAuthStore } from '../../../store/useAuthStore';
import { User, Shield, UserCheck, UserMinus, Search, Mail, Calendar, MoreVertical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const UserManagement: React.FC = () => {
  const { data: users, isLoading } = useAdminUsers();
  const { user: currentUser } = useAuthStore();
  const updateRole = useUpdateUserRole();

  const handleRoleToggle = (profile: any) => {
    if (profile.id === currentUser?.id) {
      return alert("Security Warning: You cannot demote yourself to prevent complete administrative lockout.");
    }
    const newRole = profile.role === 'admin' ? 'customer' : 'admin';
    updateRole.mutate({ id: profile.id, role: newRole });
  };

  if (isLoading) return <div className="p-8">Syncing user database...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Authorities</h1>
          <p className="text-slate-500 text-sm">Manage access control and staff privileges.</p>
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authority Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users?.map((profile: any) => (
                <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                        {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : profile.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{profile.full_name || 'Anonymous User'} {profile.id === currentUser?.id && <span className="text-[8px] text-emerald-500 ml-1">(YOU)</span>}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{profile.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      profile.role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                      profile.role === 'editor' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {profile.role === 'admin' && <Shield className="w-3 h-3" />}
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleRoleToggle(profile)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-[8px] font-black uppercase tracking-widest transition-all ${
                          profile.role === 'admin' ? 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {profile.role === 'admin' ? 'Revoke Access' : 'Grant Admin'}
                      </button>
                      {profile.id !== currentUser?.id && (
                        <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
