"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns, PassengerRow } from "./columns";

interface PassengersClientProps {
  data: PassengerRow[];
}

export function PassengersClient({ data }: PassengersClientProps) {
  // We remove the first column "name" because we want "fullName" to be the one we use, or just pass it as is and use "fullName" for searching.
  return (
    <div className="mt-8">
      <DataTable 
        columns={columns.filter(c => c.id !== "fullName")} 
        data={data} 
        searchKey="email" 
        searchPlaceholder="Search by email..."
      />
    </div>
  );
}
