"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns, type AircraftRow } from "./columns";

interface AircraftsClientProps {
  data: AircraftRow[];
}

export function AircraftsClient({ data }: AircraftsClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="registrationNum"
      searchPlaceholder="Search registration, model, manufacturer…"
      filters={[
        {
          columnId: "status",
          label: "Status",
          options: [
            { label: "Active",      value: "ACTIVE" },
            { label: "Maintenance", value: "MAINTENANCE" },
            { label: "Retired",     value: "RETIRED" },
          ],
        },
      ]}
    />
  );
}
