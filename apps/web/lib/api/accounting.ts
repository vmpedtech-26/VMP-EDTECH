import { api } from '../api-client';

export interface VentaItem {
  descripcion: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

export interface Venta {
  id?: string;
  numero: string;
  fecha: string;
  companyId: string;
  condicionIva: string;
  subtotal: number;
  iva: number;
  percepciones: number;
  total: number;
  metodoPago: string;
  estado: string;
  items: VentaItem[];
}

export const accountingApi = {
  // Accounts
  getAccounts: async () => {
    return await api.get('/accounting/accounts');
  },
  seedAccounts: async () => {
    return await api.post('/accounting/seed', {});
  },
  createAccount: async (data: any) => {
    return await api.post('/accounting/accounts', data);
  },
  
  // Ventas
  getVentas: async () => {
    return await api.get('/accounting/ventas');
  },
  createVenta: async (data: Venta) => {
    return await api.post('/accounting/ventas', data);
  },
  deleteVenta: async (id: string) => {
    return await api.delete(`/accounting/ventas/${id}`);
  },
  
  // Compras
  getCompras: async () => {
    return await api.get('/accounting/compras');
  },
  createCompra: async (data: any) => {
    return await api.post('/accounting/compras', data);
  },
  deleteCompra: async (id: string) => {
    return await api.delete(`/accounting/compras/${id}`);
  },
  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/accounting/compras/upload-pdf', formData);
  },
  
  // Reports
  getBalance: async () => {
    return await api.get('/accounting/reports/balance');
  },
  
  // Journal
  getJournal: async (desde?: string, hasta?: string) => {
    let url = '/accounting/journal';
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const queryStr = params.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }
    return await api.get(url);
  },
  createManualEntry: async (data: any) => {
    return await api.post('/accounting/journal', data);
  },
  getMayorCuenta: async (code: string, desde?: string, hasta?: string) => {
    let url = `/accounting/journal/accounts/${code}`;
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const queryStr = params.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }
    return await api.get(url);
  }
};
