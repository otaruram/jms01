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

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const inventoryApi = {
  getInventory: (params?: PaginationParams) => 
    api.get('/inventory', { params }),
  getInstallations: (params?: PaginationParams) => 
    api.get('/inventory/installations', { params }),
  createProduct: (data: { name: string; category: string; stock: number; unit: string; status?: string }) => 
    api.post('/inventory', data),
  addStock: (id: string, qty: number) => api.post(`/inventory/${id}/stock`, { qty }),
  installProduct: (productId: string, projectId: string, qty: number) => 
    api.post('/inventory/install', { productId, projectId, qty }),
  deleteProduct: (id: string) => api.delete(`/inventory/${id}`),
  deleteInstallation: (id: string) => api.delete(`/inventory/installations/${id}`),
};

export const projectApi = {
  getProjects: () => api.get('/projects'),
  getProjectDetails: (id: string) => api.get(`/projects/${id}`),
  createProject: (name: string, clientId: string, totalCapital: number) =>
    api.post('/projects', { name, clientId, totalCapital }),
  addCapital: (projectId: string, type: string, amount: number, description: string) =>
    api.post('/projects/capital', { projectId, type, amount, description }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/projects/${id}/status`, { status }),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

export const documentApi = {
  getDocuments: () => api.get('/documents'),
  createSmartDocument: (clientId: string, projectId: string, amount: number, itemsJson: string) =>
    api.post('/documents', { clientId, projectId, amount, itemsJson }),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const orderApi = {
  getOrders: () => api.get('/orders'),
  createOrder: (clientId: string, total: number) => api.post('/orders', { clientId, total }),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
};

export const sphBastApi = {
  getSph: () => api.get('/sph'),
  getBast: () => api.get('/bast'),
  createSph: (data: { clientId: string; projectId: string; subject: string; totalAmount: number; items: string }) =>
    api.post('/sph', data),
  createBast: (data: { clientId: string; projectId: string; description: string }) =>
    api.post('/bast', data),
  deleteSph: (id: string) => api.delete(`/sph/${id}`),
  deleteBast: (id: string) => api.delete(`/bast/${id}`),
};

export const reportsApi = {
  getFinance: () => api.get('/reports/finance'),
  getProjects: () => api.get('/reports/projects'),
  getTax: () => api.get('/reports/tax'),
  exportFile: (type: string, format: 'pdf' | 'excel') => 
    api.get(`/reports/export?type=${type}&format=${format}`, { responseType: 'blob' })
};

export const expenseApi = {
  getExpenses: () => api.get('/expenses'),
  createExpense: (data: { projectId?: string; amount: number; date: string; description: string; category?: string }) =>
    api.post('/expenses', data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),
};

export const taxInvoiceApi = {
  getAll: (params?: PaginationParams) => api.get('/tax-invoices', { params }),
  create: (data: any) => api.post('/tax-invoices', data),
  updateStatus: (id: string, status: string) => api.patch(`/tax-invoices/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/tax-invoices/${id}`),
};

export default api;
