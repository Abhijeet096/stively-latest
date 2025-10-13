import { MetadataRoute } from 'next';
import clientPromise from '@/lib/db/mongodb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://stively.com';

  try {
    // Get all published blogs from database
    const client = await clientPromise;
    const db = client.db('blog-platform');
    const blogs = await db
      .collection('blogs')
      .find({ status: 'published' })
      .toArray();

    // Create blog URLs
    const blogUrls = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt || blog.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Static pages
    const routes = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ];

    return [...routes, ...blogUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if DB fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ];
  }
}