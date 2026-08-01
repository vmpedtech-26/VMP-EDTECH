import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.vmp-edtech.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Googlebot', 'Bingbot'],
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
