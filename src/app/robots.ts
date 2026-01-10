import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bingou.me';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/sala/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
