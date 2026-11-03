import type { Metadata } from "next";
import { StatistikView } from "./statistik-view";

export const metadata: Metadata = { title: "Data & Statistik" };

export default function Page() {
  return <StatistikView />;
}
