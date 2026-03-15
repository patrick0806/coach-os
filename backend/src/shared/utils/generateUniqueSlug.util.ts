interface SlugChecker {
  findBySlug(slug: string): Promise<{ slug: string } | null>;
}

export async function generateUniqueSlug(
  name: string,
  slugChecker: SlugChecker,
): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 2;

  while (await slugChecker.findBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
