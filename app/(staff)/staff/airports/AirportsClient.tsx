"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns, type AirportRow } from "./columns";

interface AirportsClientProps {
  data: AirportRow[];
}

export function AirportsClient({ data }: AirportsClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="iataCode"
      searchPlaceholder="Search IATA code..."
    />
  );
}
