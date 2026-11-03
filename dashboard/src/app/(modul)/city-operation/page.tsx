import type { Metadata } from "next";
import { CityOperationView } from "./city-operation-view";

export const metadata: Metadata = { title: "City Operation" };

export default function Page() {
  return <CityOperationView />;
}
