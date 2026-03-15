import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/sobre', '/funcionalidades', '/faq'],
      disallow: [
        '/painel/',
        '/admin/',
        '/*/alunos/',
        '/api/',
        '/*/login',
        '/cadastro',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
