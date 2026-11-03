import { TopBar } from "@/components/layout/top-bar";

export default function BerandaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-app overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-30">
        <TopBar overlay />
      </div>
      {children}
    </div>
  );
}
