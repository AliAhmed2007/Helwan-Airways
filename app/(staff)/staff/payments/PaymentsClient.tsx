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
      searchPlaceholder="Search transaction reference…"
      filters={[
        {
          columnId: "status",
          label: "Status",
          options: [
            { label: "Pending",   value: "PENDING" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Failed",    value: "FAILED" },
            { label: "Refunded",  value: "REFUNDED" },
          ],
        },
        {
          columnId: "paymentMethod",
          label: "Method",
          options: [
            { label: "Credit Card", value: "CREDIT_CARD" },
            { label: "Debit Card",  value: "DEBIT_CARD" },
            { label: "Bank Transfer", value: "BANK_TRANSFER" },
            { label: "Cash",        value: "CASH" },
          ],
        },
      ]}
    />
  );
}
