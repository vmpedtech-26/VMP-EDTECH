import { api } from '../api-client';

export interface VentaItem {
  descripcion: str;
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
    const response = await api.get('/accounting/accounts');
    return response.data;
  },
  seedAccounts: async () => {
    const response = await api.post('/accounting/seed');
    return response.data;
  },
  
  // Ventas
  getVentas: async () => {
    const response = await api.get('/accounting/ventas');
    return response.data;
  },
  createVenta: async (data: Venta) => {
    const response = await api.post('/accounting/ventas', data);
    return response.data;
  },
  
  // Compras
  getCompras: async () => {
    const response = await api.get('/accounting/compras');
    return response.data;
  },
  createCompra: async (data: any) => {
    const response = await api.post('/accounting/compras', data);
    return response.data;
  },
  
  // Reports
  getBalance: async () => {
    const response = await api.get('/accounting/reports/balance');
    return response.data;
  },
  
  // Journal
  getJournal: async () => {
    const response = await api.get('/accounting/journal');
    return response.data;
  }
};
