import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bogor Command Center", template: "%s · Bogor Command Center" },
  description: "Dashboard Intelligent City Command Center Pemerintah Kota Bogor",
  icons: { icon: "/logo-kota-bogor.svg" },
};

export const viewport: Viewport = {
  themeColor: "#16172a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-app">{children}</body>
    </html>
  );
}
