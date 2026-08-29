import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { OrdersPage } from './pages/OrdersPage';
import { SphBastPage } from './pages/SphBastPage';
import { ReportsPage } from './pages/ReportsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { LandingPage } from './pages/LandingPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Memuat sesi...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LandingPage />} />
      
      <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="sph-bast" element={<SphBastPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="system" element={<SystemSettingsPage />} />
        </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
