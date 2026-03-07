import Link from "next/link";

export default function PersonalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p
        className="text-8xl font-extrabold"
        style={{ color: "var(--color-primary, #10b981)" }}
      >
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-800">
        Perfil não encontrado
      </h1>
      <p className="mt-2 max-w-sm text-gray-500">
        O personal trainer que você está procurando não existe ou foi removido da plataforma.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-primary, #10b981)" }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
