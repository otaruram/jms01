import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Activity, Shield, Users } from 'lucide-react';
import { useToast } from '../components/ui/ToastContext';

export function SystemSettingsPage() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isSuperAdmin) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'users') {
          const res = await api.get('/system/users');
          if (res.data.success) setUsers(res.data.data);
        } else {
          const res = await api.get('/system/logs');
          if (res.data.success) setLogs(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, isSuperAdmin]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast('Anda tidak bisa mengubah role Anda sendiri!', 'error');
      return;
    }

    try {
      await api.patch(`/system/users/${userId}/role`, { role: newRole });
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast('Role berhasil diperbarui!', 'success');
    } catch (error) {
      toast('Gagal memperbarui role', 'error');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Akses Ditolak</h1>
        <p className="text-gray-500 mt-2">Halaman ini khusus untuk Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Pengaturan Sistem</h1>
          <p className="text-[var(--text-secondary)]">Manajemen akses dan audit log sistem</p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-[var(--border-color)]">
        <button
          className={`pb-4 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> Manajemen Pengguna
        </button>
        <button
          className={`pb-4 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'logs' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={18} /> Audit Log (Aktivitas)
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Memuat data...</div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role Saat Ini</th>
                  <th className="py-3 px-4 text-right">Ubah Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{u.name || '-'}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== currentUser?.id && (
                        <select 
                          className="border rounded px-2 py-1 text-sm bg-white"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="USER">USER (Read-Only)</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 font-medium">{log.user?.email || 'Unknown'}</td>
                    <td className="py-3 px-4">{log.module}</td>
                    <td className="py-3 px-4">{log.action}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-500">Belum ada log aktivitas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
