"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  listAdminPersonals,
  togglePersonalStatus,
  type AdminPersonal,
} from "@/services/admin.service";

function StatusToggle({ personal }: { personal: AdminPersonal }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => togglePersonalStatus(personal.id, !personal.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-personals"] });
      toast.success(personal.isActive ? "Conta desativada." : "Conta ativada.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível alterar o status."));
    },
  });

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      aria-label={personal.isActive ? "Desativar conta" : "Ativar conta"}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
        personal.isActive ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          personal.isActive ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const PAGE_SIZE = 15;

export default function AdminPersonalsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout((window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout);
    (window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["admin-personals", { page, search: debouncedSearch }],
    queryFn: () =>
      listAdminPersonals({ page, size: PAGE_SIZE, search: debouncedSearch || undefined }),
  });

  const personals = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Personals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todos os personal trainers cadastrados na plataforma.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                E-mail
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                Plano
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                Cadastro
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ativo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-accent" />
                      </td>
                    ))}
                  </tr>
                ))
              : personals.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhum personal encontrado.
                    </td>
                  </tr>
                )
                : personals.map((p) => (
                  <tr key={p.id} className="bg-card transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{p.email}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {p.email}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {p.subscriptionPlanName ? (
                        <Badge variant="secondary" className="text-xs">
                          {p.subscriptionPlanName}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusToggle personal={p} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/personals/${p.id}`}
                        className="flex items-center justify-end text-muted-foreground hover:text-foreground"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {totalPages} — {data?.totalElements ?? 0} personals
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
