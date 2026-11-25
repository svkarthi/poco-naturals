import { STORE_INFO } from '@/theme/tokens';
import type { BlogPost } from '@/types/store';
import { decodeHtmlEntities, htmlToPlainText } from '@/utils/format';

interface RawWpPost {
  id: number;
  slug: string;
  date: string;
  link: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
  };
}

const REQUEST_TIMEOUT_MS = 8000;

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${STORE_INFO.wpApiBase}/posts?_embed&per_page=10`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as RawWpPost[];
    if (!Array.isArray(raw)) return [];

    return raw.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: decodeHtmlEntities(post.title?.rendered ?? ''),
      excerpt: htmlToPlainText(post.excerpt?.rendered ?? ''),
      content: htmlToPlainText(post.content?.rendered ?? ''),
      date: post.date,
      link: post.link,
      featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
