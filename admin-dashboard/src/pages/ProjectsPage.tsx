import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ArrowRight } from 'lucide-react';

import { Pagination } from '../components/ui/Pagination';
import { projectApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SlideOver } from '../components/ui/SlideOver';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/ToastContext';
import { Trash2 } from 'lucide-react';
import styles from './ProjectsPage.module.css';

interface Project {
  id: string;
  name: string;
  status: string;
  totalCapital: number;
  client: { name: string };
}

export function ProjectsPage() {

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isDetailSlideOverOpen, setIsDetailSlideOverOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'barang' | 'akomodasi'>('barang');
  const [newProject, setNewProject] = useState({ name: '', clientId: '', totalCapital: '' });
  const { isReadOnly } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => projectApi.createProject(data.name, data.clientId, parseFloat(data.totalCapital)),
    onSuccess: () => {
      toast('Proyek berhasil dibuat!', 'success');
      setIsSlideOverOpen(false);
      setNewProject({ name: '', clientId: '', totalCapital: '' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast('Gagal membuat proyek: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string, status: string }) => projectApi.updateStatus(data.id, data.status),
    onSuccess: () => {
      toast('Status berhasil diubah!', 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      toast('Gagal mengubah status: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: () => {
      toast('Proyek berhasil dihapus permanen!', 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (isDetailSlideOverOpen) setIsDetailSlideOverOpen(false);
    },
    onError: (error: any) => {
      toast('Gagal menghapus proyek: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.clientId) return;
    createProjectMutation.mutate(newProject);
  };

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectApi.getProjects();
      return res.data;
    }
  });

  const { data: detailResponse, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () => projectApi.getProjectDetails(selectedProjectId as string),
    enabled: !!selectedProjectId && isDetailSlideOverOpen
  });

  const selectedProject = detailResponse?.data?.data;

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus proyek ini secara permanen?')) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleOpenDetail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectId(id);
    setIsDetailSlideOverOpen(true);
  };

  const projects = response?.data || [];
  
  // Client side pagination and search
  const filteredProjects = projects.filter((p: Project) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Keuangan Proyek</h1>
          <p className={styles.subtitle}>Pantau detail pengeluaran per proyek</p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => setIsSlideOverOpen(true)}>+ Proyek Baru</Button>
        )}
      </header>

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Cari proyek..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper + " overflow-x-auto"}>
          <table className={styles.table + " min-w-[700px]"}>
            <thead>
              <tr>
                <th>ID Proyek</th>
                <th>Nama Proyek</th>
                <th>Klien</th>
                <th className="text-right pr-4">Total Modal</th>
                <th>Status</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Memuat data proyek...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-red-500">
                    Gagal memuat data proyek.
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada proyek ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p: Project) => (
                  <tr key={p.id} className={styles.row}>
                    <td className={styles.cellId}>{p.id}</td>
                    <td className={styles.cellName}>{p.name}</td>
                    <td>{p.client?.name || '-'}</td>
                    <td className="text-right pr-4">Rp {p.totalCapital.toLocaleString('id-ID')}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {!isReadOnly ? (
                        <select 
                          className="border border-slate-200 rounded p-1 text-sm bg-white"
                          value={p.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: p.id, status: e.target.value })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Tertunda">Tertunda</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                      ) : (
                        <span className={`${styles.badge} ${p.status === 'Aktif' ? styles.badgeActive : styles.badgeDone}`}>
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className={styles.textRight}>
                      <div className="flex justify-end gap-2 items-center">
                        <Button variant="ghost" size="sm" onClick={(e) => handleOpenDetail(p.id, e)}>
                          Detail <ArrowRight size={14} style={{marginLeft: 4}} />
                        </Button>
                        {!isReadOnly && (
                          <button 
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                            onClick={(e) => handleDeleteProject(p.id, e)}
                            title="Hapus Proyek"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title="Buat Proyek Baru"
      >
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
          <Input 
            label="ID Klien" 
            placeholder="Masukkan ID Klien"
            value={newProject.clientId}
            onChange={(e) => setNewProject({...newProject, clientId: e.target.value})}
            required
          />
          <Input 
            label="Nama Proyek" 
            placeholder="Masukkan Nama Proyek"
            value={newProject.name}
            onChange={(e) => setNewProject({...newProject, name: e.target.value})}
            required
          />
          <Input 
            label="Total Modal (Rp)" 
            type="number"
            placeholder="Masukkan Angka Modal"
            value={newProject.totalCapital}
            onChange={(e) => setNewProject({...newProject, totalCapital: e.target.value})}
          />
          
          <div className="flex justify-end gap-2 mt-8">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setNewProject({ name: 'Instalasi Jaringan', clientId: 'CLI-DEMO-01', totalCapital: '15000000' })}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Auto Fill (Dev)
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsSlideOverOpen(false)}>Batal</Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? 'Menyimpan...' : 'Simpan Proyek'}
            </Button>
          </div>
        </form>
      </SlideOver>

      <SlideOver 
        isOpen={isDetailSlideOverOpen} 
        onClose={() => setIsDetailSlideOverOpen(false)} 
        title={selectedProject ? `Detail Proyek: ${selectedProject.name}` : 'Detail Proyek'}
      >
        {isLoadingDetail ? (
          <div className="p-8 text-center text-slate-500">Memuat detail proyek...</div>
        ) : !selectedProject ? (
          <div className="p-8 text-center text-slate-500">Pilih proyek untuk melihat detail.</div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-500">Klien</span>
              <span className="font-medium text-gray-900">{selectedProject.client?.name || '-'}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase font-semibold">Total Modal Keseluruhan</span>
                <span className="text-lg font-bold text-gray-900">Rp 15.000.000</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-blue-50 flex flex-col gap-1">
                <span className="text-xs text-blue-500 uppercase font-semibold">Total Modal Barang</span>
                <span className="text-lg font-bold text-blue-900">Rp 12.500.000</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-orange-50 flex flex-col gap-1">
                <span className="text-xs text-orange-500 uppercase font-semibold">Total Modal Akomodasi</span>
                <span className="text-lg font-bold text-orange-900">Rp 2.500.000</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex gap-2 border-b border-gray-100 mb-4">
                <button 
                  className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'barang' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('barang')}
                >
                  Riwayat Barang
                </button>
                <button 
                  className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'akomodasi' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('akomodasi')}
                >
                  Riwayat Akomodasi
                </button>
              </div>

              {activeTab === 'barang' ? (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                  Belum ada riwayat pemasangan barang untuk proyek ini.
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                  Belum ada riwayat pengeluaran akomodasi untuk proyek ini.
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 gap-2">
              <Button variant="outline" onClick={() => setIsDetailSlideOverOpen(false)}>Tutup</Button>
              <Button onClick={() => alert('Fitur catat pengeluaran akan segera hadir')}>Catat Pengeluaran Proyek</Button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
