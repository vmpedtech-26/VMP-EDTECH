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

export interface BienDeCambio {
  id: string;
  nombre: string;
  stock: number;
  costoHistorico: number;
  costoUltimaCompra: number;
  fechaUltimaCompra: string;
}

export interface RetencionArca {
  id: string;
  fecha: string;
  cuit: string;
  tipo: string;
  nro: string;
  monto: number;
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
  getSummary: async () => {
    return await api.get('/accounting/summary');
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
  },

  // RT 54 - Configuración
  getRt54Config: async () => {
    return await api.get('/accounting/rt54/config');
  },
  updateRt54Config: async (categoriaContribuyente: string) => {
    return await api.patch('/accounting/rt54/config', { categoriaContribuyente });
  },

  // RT 54 - Bienes de Cambio
  getBienesDeCambio: async (): Promise<BienDeCambio[]> => {
    return await api.get('/accounting/rt54/inventario');
  },
  createBienDeCambio: async (data: Omit<BienDeCambio, 'id'>) => {
    return await api.post('/accounting/rt54/inventario', data);
  },
  updateBienDeCambio: async (id: string, data: Partial<Omit<BienDeCambio, 'id'>>) => {
    return await api.patch(`/accounting/rt54/inventario/${id}`, data);
  },
  deleteBienDeCambio: async (id: string) => {
    return await api.delete(`/accounting/rt54/inventario/${id}`);
  },

  // IVA - Configuración
  getIvaConfig: async () => {
    return await api.get('/accounting/iva/config');
  },
  updateIvaConfig: async (actividadIvaId: string) => {
    return await api.patch('/accounting/iva/config', { actividadIvaId });
  },
  getDebitoLibro: async () => {
    return await api.get('/accounting/iva/debito-libro');
  },

  // IVA - Retenciones ARCA
  getRetencionesArca: async (): Promise<RetencionArca[]> => {
    return await api.get('/accounting/iva/retenciones');
  },
  createRetencionArca: async (data: Omit<RetencionArca, 'id'>) => {
    return await api.post('/accounting/iva/retenciones', data);
  },
  deleteRetencionArca: async (id: string) => {
    return await api.delete(`/accounting/iva/retenciones/${id}`);
  }
};
