import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center p-6 text-center">
      <div>
        <p className="text-sm text-ink-3">404</p>
        <h1 className="mt-1 text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 text-sm font-medium text-white">
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
