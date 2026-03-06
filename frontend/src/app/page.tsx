export default function Page() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="w-full max-w-2xl rounded-xl border bg-card p-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Coach OS</h1>
          <p className="mt-3 text-muted-foreground">
            Plataforma para personal trainers gerenciarem alunos, treinos e o proprio negocio.
          </p>
        </section>
      </main>
    </div>
  );
}
