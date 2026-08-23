'use client';

import { MapPin } from 'lucide-react';
import { CatalogManager } from '@/components/admin/CatalogManager';
import { administracionApi, Localidad } from '@/lib/api/administracion';

export default function LocalidadesPage() {
    return (
        <CatalogManager
            title="Localidades"
            subtitle="Sedes y lugares de servicio"
            icon={MapPin}
            itemLabel="localidades"
            fetchItems={administracionApi.listarLocalidades}
            createItem={(nombre, extra) => administracionApi.crearLocalidad(nombre, extra?.provincia)}
            deleteItem={administracionApi.eliminarLocalidad}
            extraField={{ key: 'provincia', label: 'Provincia', placeholder: 'Provincia (opcional)' }}
            renderSecondary={(item) => (item as Localidad).provincia || null}
        />
    );
}
