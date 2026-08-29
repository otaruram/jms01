import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Hentikan request ke backend jika session belum siap untuk mencegah 401
    throw new axios.Cancel("Session belum siap, membatalkan request API.");
  }
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear local session if token is rejected by backend
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (e) {}
      localStorage.clear();
      sessionStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const inventoryApi = {
  getInventory: () => api.get('/inventory'),
  installProduct: (productId: string, projectId: string, qty: number) => 
    api.post('/inventory/install', { productId, projectId, qty }),
};

export const projectApi = {
  getProjects: () => api.get('/projects'),
  getProjectDetails: (id: string) => api.get(`/projects/${id}`),
  addCapital: (projectId: string, type: string, amount: number, description: string) =>
    api.post('/projects/capital', { projectId, type, amount, description }),
};

export const documentApi = {
  createSmartDocument: (clientId: string, projectId: string, amount: number, itemsJson: string) =>
    api.post('/documents', { clientId, projectId, amount, itemsJson }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const orderApi = {
  getOrders: () => api.get('/orders'),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

export const sphBastApi = {
  getDocuments: () => api.get('/sph-bast'),
  createDocument: (data: any) => api.post('/sph-bast', data),
};

export const reportsApi = {
  getFinance: () => api.get('/reports/finance'),
  getProjects: () => api.get('/reports/projects'),
  getTax: () => api.get('/reports/tax'),
  exportFile: (type: string, format: 'pdf' | 'excel') => 
    api.get(`/reports/export?type=${type}&format=${format}`, { responseType: 'blob' })
};

export default api;
