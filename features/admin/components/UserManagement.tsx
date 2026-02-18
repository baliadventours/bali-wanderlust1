
import React from 'react';
import { useAdminUsers, useUpdateUserRole } from '../hooks/useAdminData';
import { User, Shield, UserCheck, UserMinus, Search, Mail, Calendar, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

export const UserManagement: React.FC = () => {
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();

  if (isLoading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm">Elevate members to staff or manage permissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-[10px] text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
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
                        <div className="text-sm font-bold text-slate-900">{profile.full_name || 'Anonymous User'}</div>
                        <div className="text-xs text-slate-400 font-medium">{profile.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      profile.role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                      profile.role === 'editor' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {profile.role === 'admin' && <Shield className="w-3 h-3" />}
                      {profile.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {profile.role !== 'admin' ? (
                        <button 
                          onClick={() => updateRole.mutate({ id: profile.id, role: 'admin' })}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-[10px] text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          <UserCheck className="w-3 h-3" /> Promote to Admin
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateRole.mutate({ id: profile.id, role: 'customer' })}
                          className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-[10px] text-[10px] font-bold hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <UserMinus className="w-3 h-3" /> Revoke Admin
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
