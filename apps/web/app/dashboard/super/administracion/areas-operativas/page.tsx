'use client';

import { Layers } from 'lucide-react';
import { CatalogManager } from '@/components/admin/CatalogManager';
import { administracionApi } from '@/lib/api/administracion';

export default function AreasOperativasPage() {
    return (
        <CatalogManager
            title="Áreas Operativas"
            subtitle="Áreas operativas de la organización"
            icon={Layers}
            itemLabel="áreas operativas"
            fetchItems={administracionApi.listarAreas}
            createItem={(nombre) => administracionApi.crearArea(nombre)}
            deleteItem={administracionApi.eliminarArea}
        />
    );
}
