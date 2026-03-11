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
    sitemap: 'https://coachos.com.br/sitemap.xml', // Ajustar conforme o domínio final
  };
}
