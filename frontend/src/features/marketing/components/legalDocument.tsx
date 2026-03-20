interface Section {
  id: string;
  title: string;
}

interface LegalDocumentProps {
  sections: Section[];
  children: React.ReactNode;
  updatedAt: string;
}

export function LegalDocument({ sections, children, updatedAt }: LegalDocumentProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="mb-10 text-sm text-muted-foreground">
        Última atualização: <span className="font-medium text-foreground">{updatedAt}</span>
      </p>

      <div className="flex gap-16">
        {/* Sidebar TOC — desktop only */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nesta página
            </p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {section.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Document content */}
        <article className="min-w-0 flex-1 prose-legal">
          {children}
        </article>
      </div>
    </div>
  );
}
