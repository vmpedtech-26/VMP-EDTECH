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
  
  // Ventas
  getVentas: async () => {
    return await api.get('/accounting/ventas');
  },
  createVenta: async (data: Venta) => {
    return await api.post('/accounting/ventas', data);
  },
  
  // Compras
  getCompras: async () => {
    return await api.get('/accounting/compras');
  },
  createCompra: async (data: any) => {
    return await api.post('/accounting/compras', data);
  },
  
  // Reports
  getBalance: async () => {
    return await api.get('/accounting/reports/balance');
  },
  
  // Journal
  getJournal: async () => {
    return await api.get('/accounting/journal');
  }
};
