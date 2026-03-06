interface AlunoPainelPageProps {
  params: Promise<{ "slug-personal": string }>;
}

export default async function AlunoPainelPage({ params }: AlunoPainelPageProps) {
  const resolvedParams = await params;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-2xl rounded-xl border bg-card p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Painel do Aluno</h1>
        <p className="mt-3 text-muted-foreground">Personal: {resolvedParams["slug-personal"]}</p>
      </section>
    </main>
  );
}
