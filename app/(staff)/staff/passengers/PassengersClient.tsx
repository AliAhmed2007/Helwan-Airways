"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns, type PassengerRow } from "./columns";

interface PassengersClientProps {
  data: PassengerRow[];
}

export function PassengersClient({ data }: PassengersClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="email"
      searchPlaceholder="Search name, email, passport…"
      filters={[
        {
          columnId: "nationality",
          label: "Nationality",
          options: Array.from(new Set(data.map((p) => p.nationality).filter(Boolean)))
            .sort()
            .map((n) => ({ label: n as string, value: n as string })),
        },
      ]}
    />
  );
}
