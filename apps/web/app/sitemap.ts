import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.vmp-edtech.com';
    const lastModified = new Date();

    const staticRoutes = [
        '',
        '/cursos',
        '/cursos/conduccion-preventiva',
        '/cursos/conduccion-invernal',
        '/cursos/flota-liviana-pesada',
        '/cursos/doble-traccion',
        '/cursos/trabajo-en-altura',
        '/cursos/conduccion-renovacion',
        '/cursos/conduccion-segura',
        '/validar',
        '/compliance/canal-denuncias',
        '/blog',
        '/terminos',
        '/privacidad',
    ];

    return staticRoutes.map((route) => {
        let priority = 0.8;
        let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly';

        if (route === '') {
            priority = 1.0;
            changeFrequency = 'daily';
        } else if (route.startsWith('/cursos')) {
            priority = 0.9;
            changeFrequency = 'weekly';
        } else if (route === '/validar') {
            priority = 0.9;
            changeFrequency = 'daily';
        }

        return {
            url: `${baseUrl}${route}`,
            lastModified,
            changeFrequency,
            priority,
        };
    });
}
