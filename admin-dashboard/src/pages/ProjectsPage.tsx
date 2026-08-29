import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/ui/Pagination';
import { projectApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
  const { isReadOnly } = useAuth();

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
        {!isReadOnly && <Button>+ Proyek Baru</Button>}
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
                    <td>
                      <span className={`${styles.badge} ${p.status === 'Aktif' ? styles.badgeActive : styles.badgeDone}`}>
                        {p.status}
                      </span>
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
    </div>
  );
}
