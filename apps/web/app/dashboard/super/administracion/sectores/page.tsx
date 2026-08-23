'use client';

import { Building } from 'lucide-react';
import { CatalogManager } from '@/components/admin/CatalogManager';
import { administracionApi } from '@/lib/api/administracion';

export default function SectoresPage() {
    return (
        <CatalogManager
            title="Sectores"
            subtitle="Sectores de la organización"
            icon={Building}
            itemLabel="sectores"
            fetchItems={administracionApi.listarSectores}
            createItem={(nombre) => administracionApi.crearSector(nombre)}
            deleteItem={administracionApi.eliminarSector}
        />
    );
}
