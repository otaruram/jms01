import { Card } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import styles from './DashboardPage.module.css';
import { Button } from '../components/ui/Button';
import { RefreshCw, AlertCircle, Package, TrendingUp, DollarSign } from 'lucide-react';

export function DashboardPage() {
  const { data: stats, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </header>

        <div className={styles.metricsGrid}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className={styles.metricCard}>
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>

        <div className={styles.chartsGrid}>
          <Card className={styles.chartCard}>
            <div className="animate-pulse space-y-4 h-64 flex flex-col justify-end">
              <div className="flex space-x-4 items-end h-48 px-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${i * 15}%` }}></div>
                ))}
              </div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Ringkasan aktivitas hari ini</p>
        </header>

        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm text-center px-4">
          <div className="p-4 bg-red-50 rounded-full text-red-500 mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Dashboard</h3>
          <p className="text-gray-500 max-w-sm mb-6">
            Terjadi kesalahan saat mengambil data dari server. Mohon periksa koneksi internet Anda atau coba sesaat lagi.
          </p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Ringkasan aktivitas hari ini</p>
      </header>

      <div className={styles.metricsGrid}>
        <Card className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Pesanan</span>
            <Package className={styles.metricIcon} size={20} />
          </div>
          <div className={styles.metricValue}>{stats?.totalOrders || 0}</div>
          <div className={styles.metricTrend}>
            <TrendingUp size={14} className={styles.trendUp} />
            <span className={styles.trendText}>+12% dari bulan lalu</span>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Modal</span>
            <DollarSign className={styles.metricIcon} size={20} />
          </div>
          <div className={styles.metricValue}>Rp {((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M</div>
          <div className={styles.metricTrend}>
            <span className={styles.trendTextNeutral}>Terkunci di {stats?.activeProjects || 0} proyek aktif</span>
          </div>
        </Card>

        <Card className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Sisa Stok Kritis</span>
            <Package className={styles.metricIcon} size={20} />
          </div>
          <div className={styles.metricValue}>{stats?.lowStockProducts || 0} <span className={styles.metricUnit}>Item</span></div>
          <div className={styles.metricTrend}>
            <span className={styles.trendTextWarning}>Butuh restock segera</span>
          </div>
        </Card>
      </div>

      <div className={styles.chartsGrid}>
        <Card title="Pendapatan (6 Bulan Terakhir)" className={styles.chartCard}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#F9FAFB'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
