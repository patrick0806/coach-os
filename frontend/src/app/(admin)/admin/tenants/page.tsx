"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/shared/components/pageHeader";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useAdminTenants } from "@/features/admin/hooks/useAdminTenants";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  trialing: "outline",
  past_due: "destructive",
  suspended: "destructive",
  expired: "secondary",
};

export default function AdminTenantsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useAdminTenants({
    page,
    size: 20,
    search: debouncedSearch || undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Todos os coaches cadastrados na plataforma."
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !data?.content.length ? (
        <p className="text-muted-foreground">Nenhum tenant encontrado.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Whitelist</TableHead>
                <TableHead>Onboarding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Link
                      href={`/admin/tenants/${tenant.id}`}
                      className="font-medium hover:underline"
                    >
                      {tenant.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusColors[tenant.accessStatus] ?? "outline"}
                    >
                      {tenant.accessStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tenant.isWhitelisted ? "default" : "secondary"}
                    >
                      {tenant.isWhitelisted ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tenant.onboardingCompleted ? "default" : "secondary"
                      }
                    >
                      {tenant.onboardingCompleted ? "Completo" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {data.totalElements} tenant
              {data.totalElements !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm">
                {page + 1} / {data.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages - 1}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
