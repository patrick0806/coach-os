import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Coach OS",
  description: "Painel de controle do Coach OS",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo ao Coach OS. Seu painel está sendo desenvolvido.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Alunos ativos", "Treinos criados", "Sessões este mês", "Taxa de conclusão"].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-bold">—</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
