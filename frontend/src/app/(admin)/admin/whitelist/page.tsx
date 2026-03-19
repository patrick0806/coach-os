"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

import { PageHeader } from "@/shared/components/pageHeader";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  useAdminWhitelist,
  useAddToWhitelist,
  useRemoveFromWhitelist,
} from "@/features/admin/hooks/useAdminWhitelist";

export default function AdminWhitelistPage() {
  const { data: coaches, isLoading } = useAdminWhitelist();
  const addToWhitelist = useAddToWhitelist();
  const removeFromWhitelist = useRemoveFromWhitelist();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [personalId, setPersonalId] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await addToWhitelist.mutateAsync(personalId);
      setPersonalId("");
      setDialogOpen(false);
    } catch {
      setError("Não foi possível adicionar. Verifique o ID do personal.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Whitelist"
        description="Coaches com acesso especial à plataforma."
        actions={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="size-4 mr-2" />
            Adicionar
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !coaches?.length ? (
        <p className="text-muted-foreground">Nenhum coach na whitelist.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.map((coach) => (
              <TableRow key={coach.id}>
                <TableCell className="font-medium">{coach.name}</TableCell>
                <TableCell>{coach.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {coach.slug}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{coach.accessStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive"
                    onClick={() => removeFromWhitelist.mutate(coach.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar à Whitelist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalId">ID do Personal</Label>
              <Input
                id="personalId"
                value={personalId}
                onChange={(e) => setPersonalId(e.target.value)}
                placeholder="UUID do personal"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={addToWhitelist.isPending}>
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
