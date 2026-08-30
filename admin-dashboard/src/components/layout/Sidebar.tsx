import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, Briefcase, FileText, ShoppingCart, FileCheck, BarChart3, LogOut, Settings, Wallet, FileSpreadsheet } from 'lucide-react';
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
      { name: 'Pengeluaran', path: '/expenses', icon: Wallet },
    ]
  },
  {
    label: 'ADMINISTRASI',
    items: [
      { name: 'Dokumen', path: '/documents', icon: FileText },
      { name: 'Faktur Pajak', path: '/tax-invoices', icon: FileSpreadsheet },
      { name: 'SPH & BAST', path: '/sph-bast', icon: FileCheck },
    ]
  },
  {
    label: 'AUDIT & LAPORAN',
    items: [
      { name: 'Pusat Rekapan', path: '/reports', icon: BarChart3 },
    ]
  },
  {
    label: 'UTILITAS',
    items: [
      { name: 'PDF Tools', path: '/pdf-tools', icon: FileText },
    ]
  }
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar(_props: SidebarProps) {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();

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

      <div className="p-4 border-t border-slate-200 space-y-2">
        <NavLink 
          to="/profile"
          className={({ isActive }) => 
            isActive 
              ? 'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 transition-colors' 
              : 'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors'
          }
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden text-left">
            <span className="font-semibold text-sm truncate">{user?.name || 'Pengguna'}</span>
            <span className="text-xs opacity-80 truncate">{user?.email}</span>
          </div>
        </NavLink>

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
