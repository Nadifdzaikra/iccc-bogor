import type { Metadata } from "next";
import { EwsView } from "./ews-view";

export const metadata: Metadata = { title: "EWS & AI" };

export default function Page() {
  return <EwsView />;
}
