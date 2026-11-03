import type { Metadata } from "next";
import { GeospasialView } from "./geospasial-view";

export const metadata: Metadata = { title: "GeoSpasial" };

export default function Page() {
  return <GeospasialView />;
}
