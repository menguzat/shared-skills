// Illustrative Next.js sitemap. `lastModified` must reflect real material updates.
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com/',
      lastModified: new Date('2026-08-01'),
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: 'https://example.com/products/example-product',
      lastModified: new Date('2026-08-12'),
      changeFrequency: 'weekly',
      priority: 0.9
    }
  ];
}
