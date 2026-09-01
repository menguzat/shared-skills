// Illustrative Next.js metadata pattern. Adapt to the installed framework version.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Example Product | Example Brand',
  description: 'Verified, user-useful description of the actual page.',
  alternates: { canonical: 'https://example.com/products/example-product' },
  openGraph: {
    title: 'Example Product | Example Brand',
    description: 'Verified, user-useful description of the actual page.',
    url: 'https://example.com/products/example-product',
    type: 'website'
  }
};
