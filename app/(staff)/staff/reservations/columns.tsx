"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateReservationStatus, staffCancelReservation } from "@/lib/actions/staff";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ReservationRow = {
  reservationId: string;
  bookingRef: string;
  clerkUserId: string;
  travelClass: string;
  totalAmount: string | number;
  status: string;
  checkInStatus: string;
  boardingGroup: string | null;
  createdAt: Date;
  passenger: { firstName: string; lastName: string; email: string; phone: string | null };
  flight: {
    flightId: string;
    flightNumber: string;
    schedDeparture: Date;
    depAirport: { iataCode: string; city: string };
    arrAirport: { iataCode: string; city: string };
  };
  seat: { seatNumber: string; class: string } | null;
  payments: { status: string; amount: string | number; paymentMethod: string }[];
  baggage: { baggageId: string; status: string }[];
};

export type ReservationHistoryRow = {
  historyId: string;
  reservationId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string | null;
  changeTime: Date;
  reason: string | null;
  reservation: {
    passenger: { firstName: string; lastName: string; email: string };
    flight: { flightNumber: string };
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600",
  CONFIRMED: "bg-emerald-500/10 text-emerald-600",
  CANCELLED: "bg-red-500/10 text-red-600",
  COMPLETED: "bg-blue-500/10 text-blue-600",
};

const CLASS_COLORS: Record<string, string> = {
  FIRST: "bg-amber-500/10 text-amber-600",
  BUSINESS: "bg-violet-500/10 text-violet-600",
  ECONOMY: "bg-blue-500/10 text-blue-600",
};

function StatusBadge({ status, colorMap }: { status: string; colorMap: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${colorMap[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Actions Cell ──────────────────────────────────────────────────────────────
function ReservationActionsCell({ row }: { row: { original: ReservationRow } }) {
  const router = useRouter();

  async function handleStatusUpdate(status: string) {
    const res = await updateReservationStatus(row.original.reservationId, status);
    if (res.success) {
      toast.success(`Reservation updated to ${status}`);
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to update");
    }
  }

  async function handleCancel() {
    if (!confirm(`Cancel reservation ${row.original.bookingRef}?`)) return;
    const res = await staffCancelReservation(row.original.reservationId);
    if (res.success) {
      toast.success("Reservation cancelled and refunded");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to cancel");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Reservation Management</DropdownMenuLabel>
          <DropdownMenuItem asChild className="text-sm cursor-pointer">
            <Link href={`/staff/flights/${row.original.flight.flightId}/manifest`}>
              View Flight Manifest
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Update Status</DropdownMenuLabel>
          {["PENDING", "CONFIRMED", "COMPLETED"].map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusUpdate(s)}
              disabled={s === row.original.status}
              className="text-sm"
            >
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 text-sm"
          onClick={handleCancel}
          disabled={row.original.status === "CANCELLED"}
        >
          Cancel &amp; Refund
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Reservation Columns ──────────────────────────────────────────────────────
export const reservationColumns: ColumnDef<ReservationRow>[] = [
  {
    accessorKey: "bookingRef",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Ref <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-mono font-bold text-sm">{row.original.bookingRef}</span>,
  },
  {
    id: "passenger",
    header: "Passenger",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">{row.original.passenger.firstName} {row.original.passenger.lastName}</div>
        <div className="text-xs text-muted-foreground">{row.original.passenger.email}</div>
      </div>
    ),
  },
  {
    id: "flight",
    header: "Flight",
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-mono font-semibold">{row.original.flight.flightNumber}</span>
        <div className="text-xs text-muted-foreground">
          {row.original.flight.depAirport.iataCode} → {row.original.flight.arrAirport.iataCode}
        </div>
      </div>
    ),
  },
  {
    id: "seat",
    header: "Seat",
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-mono font-medium">{row.original.seat?.seatNumber ?? "—"}</span>
        {row.original.seat && (
          <div><StatusBadge status={row.original.travelClass} colorMap={CLASS_COLORS} /></div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Amount <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm font-medium">${Number(row.original.totalAmount).toLocaleString()}</span>,
  },
  {
    accessorKey: "checkInStatus",
    header: "Check-in",
    cell: ({ row }) => (
      <Badge variant={row.original.checkInStatus === "CHECKED_IN" ? "default" : "secondary"} className="text-[10px]">
        {row.original.checkInStatus === "CHECKED_IN" ? "Checked In" : "Not Checked In"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} colorMap={STATUS_COLORS} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Booked <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span>,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ReservationActionsCell row={row} />,
  },
];

// ─── Reservation History Columns ──────────────────────────────────────────────
export const historyColumns: ColumnDef<ReservationHistoryRow>[] = [
  {
    id: "booking",
    header: "Reservation",
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-mono font-bold">{row.original.reservation.flight.flightNumber}</span>
        <div className="text-xs text-muted-foreground">
          {row.original.reservation.passenger.firstName} {row.original.reservation.passenger.lastName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "changeTime",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Time <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm">{format(new Date(row.original.changeTime), "dd MMM yyyy HH:mm")}</span>,
  },
  {
    id: "change",
    header: "Change",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={row.original.oldStatus} colorMap={STATUS_COLORS} />
        <span className="text-muted-foreground text-xs">→</span>
        <StatusBadge status={row.original.newStatus} colorMap={STATUS_COLORS} />
      </div>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.reason ?? "—"}</span>,
  },
];
