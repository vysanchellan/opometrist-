import type { MetadataRoute } from 'next';
import { practice } from '@/config/practice';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: practice.url, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
