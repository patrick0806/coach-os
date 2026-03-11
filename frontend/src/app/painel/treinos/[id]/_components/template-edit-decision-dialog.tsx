"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TemplateEditDecisionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel: () => void;
    onFork: () => void;
    onUpdateTemplate: () => void;
    isPending: boolean;
}

export function TemplateEditDecisionDialog({
    open,
    onOpenChange,
    onCancel,
    onFork,
    onUpdateTemplate,
    isPending,
}: TemplateEditDecisionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Alterar modelo de treino</DialogTitle>
                    <DialogDescription>
                        Este treino é baseado em um modelo e está vinculado a alunos. O que você deseja fazer?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-4">
                    <Button
                        variant="outline"
                        className="flex-col items-start h-auto p-4 text-left"
                        onClick={onFork}
                        disabled={isPending}
                    >
                        <span className="font-semibold block mb-1">
                            Alterar apenas para o aluno
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-normal block">
                            Cria um treino personalizado e aplica as alterações apenas nele.
                        </span>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex-col items-start h-auto p-4 text-left"
                        onClick={onUpdateTemplate}
                        disabled={isPending}
                    >
                        <span className="font-semibold block mb-1">
                            Alterar o modelo para todos
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-normal block">
                            Atualiza o modelo principal, o que pode afetar outros alunos.
                        </span>
                    </Button>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onCancel} disabled={isPending}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
