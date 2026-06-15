/**
 * Convert an arbitrary string into a URL-safe slug/handle.
 */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure a slug is unique against a set of existing slugs by appending a numeric suffix.
 */
export function uniqueSlug(base: string, existing: Set<string> | string[]): string {
  const set = existing instanceof Set ? existing : new Set(existing);
  let slug = slugify(base) || 'item';
  if (!set.has(slug)) return slug;

  let counter = 1;
  while (set.has(`${slug}-${counter}`)) {
    counter += 1;
  }
  return `${slug}-${counter}`;
}

export function randomSuffixSlug(base: string, length = 6): string {
  const suffix = Math.random()
    .toString(36)
    .slice(2, 2 + length);
  return `${slugify(base) || 'item'}-${suffix}`;
}
