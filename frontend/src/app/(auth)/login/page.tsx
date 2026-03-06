import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Acesse sua conta no Coach OS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="joao@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" placeholder="********" />
            </div>
            <Button className="w-full" type="submit">
              Entrar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Ainda nao tem conta?{" "}
              <Link className="font-medium text-primary hover:underline" href="/cadastro">
                Cadastre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
