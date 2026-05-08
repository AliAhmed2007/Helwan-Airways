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
      searchPlaceholder="Search IATA code, city, country…"
      filters={[
        {
          columnId: "country",
          label: "Country",
          options: Array.from(new Set(data.map((a) => a.country)))
            .sort()
            .map((c) => ({ label: c, value: c })),
        },
        {
          columnId: "timezone",
          label: "Timezone",
          options: Array.from(new Set(data.map((a) => a.timezone)))
            .sort()
            .map((t) => ({ label: t, value: t })),
        },
      ]}
    />
  );
}
