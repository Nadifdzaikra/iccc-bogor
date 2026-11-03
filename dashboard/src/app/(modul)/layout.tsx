import { TopBar } from "@/components/layout/top-bar";

export default function ModulLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <TopBar />
      <main className="flex-1 px-4 pt-4 pb-8 sm:px-8 lg:px-12 2xl:pt-6">{children}</main>
    </div>
  );
}
