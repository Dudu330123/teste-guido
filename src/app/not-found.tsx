import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 text-center">
      <h1 className="text-4xl font-bold">Página não encontrada</h1>
      <p className="mt-4">Este conteúdo pode ainda estar em preparação.</p>
      <Link href="/" className="primary-action mt-7 inline-block min-h-12 px-6 py-3 font-bold">Voltar ao início</Link>
    </main>
  );
}
