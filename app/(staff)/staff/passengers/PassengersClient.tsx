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
      searchPlaceholder="Search by email..."
    />
  );
}
