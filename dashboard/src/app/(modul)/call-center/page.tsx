import type { Metadata } from "next";
import { CallCenterView } from "./call-center-view";

export const metadata: Metadata = { title: "Call Center" };

export default function Page() {
  return <CallCenterView />;
}
