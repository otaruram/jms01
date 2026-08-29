import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/ui/Pagination';
import { projectApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SlideOver } from '../components/ui/SlideOver';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/ToastContext';
import styles from './ProjectsPage.module.css';

interface Project {
  id: string;
  name: string;
  status: string;
  totalCapital: number;
  client: { name: string };
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
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

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
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
                  <tr key={p.id} className={styles.row} onClick={() => navigate(`/projects/${p.id}`)}>
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
                      <Button variant="ghost" size="sm">
                        Detail <ArrowRight size={14} style={{marginLeft: 4}} />
                      </Button>
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
    </div>
  );
}
