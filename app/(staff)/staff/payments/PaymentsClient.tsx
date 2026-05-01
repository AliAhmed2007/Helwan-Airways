"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns, type PaymentRow } from "./columns";

interface PaymentsClientProps {
  data: PaymentRow[];
}

export function PaymentsClient({ data }: PaymentsClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="transactRef"
      searchPlaceholder="Search transaction reference..."
    />
  );
}
