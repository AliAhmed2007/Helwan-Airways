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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateBaggageStatus } from "@/lib/actions/staff";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SeatRow = {
  seatId: string;
  seatNumber: string;
  class: string;
  isAisle: boolean;
  isWindow: boolean;
  extraPrice: string | number;
  aircraft: { registrationNum: string; model: string };
  _count: { reservations: number };
};

export type BaggageRow = {
  baggageId: string;
  baggageType: string;
  weightKg: string | number | null;
  status: string;
  tag: string | null;
  fee: string | number;
  createdAt: Date;
  reservation: {
    passenger: { firstName: string; lastName: string; email: string };
    flight: {
      flightNumber: string;
      schedDeparture: Date;
      depAirport: { iataCode: string };
      arrAirport: { iataCode: string };
    };
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CLASS_COLORS: Record<string, string> = {
  FIRST: "bg-amber-500/10 text-amber-600",
  BUSINESS: "bg-violet-500/10 text-violet-600",
  ECONOMY: "bg-blue-500/10 text-blue-600",
};

const BAGGAGE_STATUS_COLORS: Record<string, string> = {
  CHECKED_IN: "bg-blue-500/10 text-blue-600",
  LOADED: "bg-violet-500/10 text-violet-600",
  IN_TRANSIT: "bg-sky-500/10 text-sky-600",
  DELIVERED: "bg-emerald-500/10 text-emerald-600",
  LOST: "bg-red-500/10 text-red-600",
};

// ─── Baggage Actions Cell ──────────────────────────────────────────────────────
function BaggageActionsCell({ row }: { row: { original: BaggageRow } }) {
  const router = useRouter();

  async function handleStatusUpdate(status: string) {
    const res = await updateBaggageStatus(row.original.baggageId, status);
    if (res.success) {
      toast.success(`Baggage status updated to ${status}`);
      router.refresh();
    } else {
      toast.error("Failed to update status");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Update Status</DropdownMenuLabel>
        {["CHECKED_IN", "LOADED", "IN_TRANSIT", "DELIVERED", "LOST"].map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleStatusUpdate(s)}
            disabled={s === row.original.status}
            className="text-sm"
          >
            {s.replace(/_/g, " ")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Seat Columns ─────────────────────────────────────────────────────────────
export const seatColumns: ColumnDef<SeatRow>[] = [
  {
    accessorKey: "seatNumber",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Seat <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-mono font-bold text-sm">{row.original.seatNumber}</span>,
  },
  {
    id: "aircraft",
    header: "Aircraft",
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{row.original.aircraft.model}</div>
        <div className="text-xs text-muted-foreground font-mono">{row.original.aircraft.registrationNum}</div>
      </div>
    ),
  },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) => (
      <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${CLASS_COLORS[row.original.class] ?? "bg-muted text-muted-foreground"}`}>
        {row.original.class}
      </span>
    ),
  },
  {
    id: "position",
    header: "Position",
    cell: ({ row }) => (
      <div className="flex gap-1.5">
        {row.original.isWindow && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Window</Badge>}
        {row.original.isAisle && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Aisle</Badge>}
        {!row.original.isWindow && !row.original.isAisle && <span className="text-xs text-muted-foreground">Middle</span>}
      </div>
    ),
  },
  {
    accessorKey: "extraPrice",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Extra <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm">${Number(row.original.extraPrice).toFixed(0)}</span>
    ),
  },
  {
    id: "booked",
    accessorFn: (row) => row._count.reservations,
    header: "Booked",
    cell: ({ row }) => (
      <Badge variant={row.original._count.reservations > 0 ? "default" : "secondary"} className="font-mono">
        {row.original._count.reservations > 0 ? "Booked" : "Available"}
      </Badge>
    ),
  },
];

// ─── Baggage Columns ──────────────────────────────────────────────────────────
export const baggageColumns: ColumnDef<BaggageRow>[] = [
  {
    accessorKey: "tag",
    header: "Tag",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">{row.original.tag ?? "—"}</span>
    ),
  },
  {
    id: "passenger",
    header: "Passenger",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">{row.original.reservation.passenger.firstName} {row.original.reservation.passenger.lastName}</div>
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
    accessorKey: "baggageType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">{row.original.baggageType.replace(/_/g, " ")}</Badge>
    ),
  },
  {
    accessorKey: "weightKg",
    header: "Weight",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.weightKg ? `${Number(row.original.weightKg)} kg` : "—"}</span>
    ),
  },
  {
    accessorKey: "fee",
    header: "Fee",
    cell: ({ row }) => <span className="text-sm font-medium">${Number(row.original.fee)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${BAGGAGE_STATUS_COLORS[row.original.status] ?? "bg-muted text-muted-foreground"}`}>
        {row.original.status.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <BaggageActionsCell row={row} />,
  },
];
