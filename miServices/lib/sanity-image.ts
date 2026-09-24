import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';

/**
 * Image URL builder, safe to import from client components: it only needs
 * the project ID and dataset, never an API token or the data client.
 */
const builder = imageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
