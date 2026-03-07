"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Student } from "@/services/students.service";

interface StudentsTableProps {
  students: Student[];
  isLoading: boolean;
  debouncedSearch: string;
  onEdit: (student: Student) => void;
  onDeactivate: (student: Student) => void;
}

export function StudentsTable({
  students,
  isLoading,
  debouncedSearch,
  onEdit,
  onDeactivate,
}: StudentsTableProps) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-gray-400">
                    <UserRound className="mx-auto mb-3 size-10 opacity-30" />
                    {debouncedSearch
                      ? "Nenhum aluno encontrado para esta busca."
                      : "Você ainda não tem alunos cadastrados."}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} className="group">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-gray-500">{student.email}</TableCell>
                    <TableCell>
                      <Badge variant={student.isActive ? "default" : "secondary"}>
                        {student.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/painel/alunos/${student.id}`)}
                          >
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(student)}>
                            Editar
                          </DropdownMenuItem>
                          {student.isActive ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDeactivate(student)}
                              >
                                Desativar
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
