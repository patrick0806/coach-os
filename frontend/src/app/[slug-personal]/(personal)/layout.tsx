const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

interface PersonalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ "slug-personal": string }>;
}

async function fetchThemeColor(slug: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/personals/${slug}/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return "#10b981";
    const data = (await res.json()) as { themeColor?: string };
    return data.themeColor ?? "#10b981";
  } catch {
    return "#10b981";
  }
}

export default async function PersonalLayout({ children, params }: PersonalLayoutProps) {
  const { "slug-personal": slug } = await params;
  const themeColor = await fetchThemeColor(slug);

  return (
    <div style={{ "--color-theme": themeColor } as React.CSSProperties}>
      {children}
    </div>
  );
}
