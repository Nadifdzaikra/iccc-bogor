import type { Metadata } from "next";
import { SurveillanceView } from "./surveillance-view";

export const metadata: Metadata = { title: "Surveillance" };

export default function Page() {
  return <SurveillanceView />;
}
