import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';

export function ProfileSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = () => {
    // In a real app, this would call an API to update the profile
    toast('Profil berhasil diperbarui!', 'success');
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Pengaturan Profil</h1>
          <p className="text-[var(--text-secondary)]">Kelola informasi pribadi dan preferensi akun Anda</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-lg text-slate-800">{user.name || 'Pengguna'}</h3>
            <p className="text-slate-500 text-sm mb-4">{user.email}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
              user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {user.role}
            </span>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card title="Informasi Pribadi" className="p-6">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User size={16} /> Nama Lengkap
                </label>
                <input 
                  type="text" 
                  defaultValue={user.name || ''} 
                  disabled={!isEditing}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Mail size={16} /> Alamat Email
                </label>
                <input 
                  type="email" 
                  defaultValue={user.email} 
                  disabled
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah karena terhubung dengan autentikasi utama.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Shield size={16} /> Peran (Role)
                </label>
                <input 
                  type="text" 
                  defaultValue={user.role} 
                  disabled
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Peran akun hanya dapat diubah oleh Super Admin.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
                    <Button className="flex items-center gap-2" onClick={handleSave}>
                      <Save size={16} /> Simpan Perubahan
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profil</Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
