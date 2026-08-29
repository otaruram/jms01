import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, Briefcase, FileText, ShoppingCart, FileCheck, BarChart3, LogOut, X, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    label: 'MENU UTAMA',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ]
  },
  {
    label: 'OPERASIONAL',
    items: [
      { name: 'Inventaris', path: '/inventory', icon: Box },
      { name: 'Proyek', path: '/projects', icon: Briefcase },
      { name: 'Pesanan', path: '/orders', icon: ShoppingCart },
    ]
  },
  {
    label: 'ADMINISTRASI',
    items: [
      { name: 'Dokumen', path: '/documents', icon: FileText },
      { name: 'SPH & BAST', path: '/sph-bast', icon: FileCheck },
    ]
  },
  {
    label: 'AUDIT & LAPORAN',
    items: [
      { name: 'Pusat Rekapan', path: '/reports', icon: BarChart3 },
    ]
  }
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <aside className="w-full md:w-64 h-full bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="pt-10 pb-8 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-slate-900">PT Jayata Medika</span>
            <span className="text-sm text-slate-500">Sentosa</span>
          </div>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <span className="mt-6 mb-2 px-6 text-xs text-slate-400 font-bold uppercase tracking-wider">{group.label}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    isActive 
                      ? 'bg-slate-100 text-slate-900 font-semibold rounded-lg px-4 py-2 mx-2 flex items-center gap-2' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-4 py-2 mx-2 flex items-center gap-2 transition-colors'
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}

        {isSuperAdmin && (
          <div className="flex flex-col gap-1">
            <span className="mt-6 mb-2 px-6 text-xs text-slate-400 font-bold uppercase tracking-wider">PENGATURAN SISTEM</span>
            <NavLink
              to="/system"
              className={({ isActive }) => 
                isActive 
                  ? 'bg-slate-100 text-slate-900 font-semibold rounded-lg px-4 py-2 mx-2 flex items-center gap-2' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-4 py-2 mx-2 flex items-center gap-2 transition-colors'
              }
            >
              <Settings size={20} />
              <span>Manajemen Pengguna</span>
            </NavLink>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button 
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
