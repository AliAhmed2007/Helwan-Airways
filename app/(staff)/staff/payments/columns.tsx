"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { refundPayment } from "@/lib/actions/staff";
import { useRouter } from "next/navigation";

export type PaymentRow = {
  paymentId: string;
  amount: string | number;
  paymentMethod: string;
  paymentDate: Date;
  transactRef: string | null;
  status: string;
  refundAmount: string | number | null;
  refundDate: Date | null;
  createdAt: Date;
  reservation: {
    reservationId: string;
    bookingRef: string;
    passenger: { firstName: string; lastName: string; email: string };
    flight: {
      flightNumber: string;
      depAirport: { iataCode: string };
      arrAirport: { iataCode: string };
    };
  };
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600",
  COMPLETED: "bg-emerald-500/10 text-emerald-600",
  REFUNDED: "bg-violet-500/10 text-violet-600",
  FAILED: "bg-red-500/10 text-red-600",
};

const METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  ONLINE: "Online",
};

function PaymentActionsCell({ row }: { row: { original: PaymentRow } }) {
  const router = useRouter();

  async function handleRefund() {
    if (!confirm("Issue a full refund for this payment?")) return;
    const res = await refundPayment(row.original.paymentId);
    if (res.success) {
      toast.success("Payment refunded");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to refund");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={handleRefund}
          disabled={row.original.status !== "COMPLETED"}
          className="text-sm"
        >
          Issue Refund
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<PaymentRow>[] = [
  {
    accessorKey: "transactRef",
    header: "Transaction",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">{row.original.transactRef ?? "—"}</span>
    ),
  },
  {
    id: "passenger",
    header: "Passenger",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">
          {row.original.reservation.passenger.firstName} {row.original.reservation.passenger.lastName}
        </div>
        <div className="text-xs text-muted-foreground">{row.original.reservation.passenger.email}</div>
      </div>
    ),
  },
  {
    id: "flight",
    header: "Flight",
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-mono font-semibold">{row.original.reservation.flight.flightNumber}</span>
        <div className="text-xs text-muted-foreground">
          {row.original.reservation.flight.depAirport.iataCode} → {row.original.reservation.flight.arrAirport.iataCode}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Amount <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">${Number(row.original.amount).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {METHOD_LABELS[row.original.paymentMethod] ?? row.original.paymentMethod}
      </Badge>
    ),
  },
  {
    accessorKey: "paymentDate",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{format(new Date(row.original.paymentDate), "dd MMM yyyy")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[row.original.status] ?? "bg-muted text-muted-foreground"}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    id: "refund",
    header: "Refund",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.refundAmount ? `$${Number(row.original.refundAmount).toLocaleString()}` : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PaymentActionsCell row={row} />,
  },
];
