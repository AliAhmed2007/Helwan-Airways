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
import { deleteFlight } from "@/lib/actions/staff";
import { updateFlightStatus } from "@/lib/actions/flights";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
export type FlightRow = {
  flightId: string;
  flightNumber: string;
  schedDeparture: Date;
  schedArrival: Date;
  basePrice: string | number;
  status: string;
  isRoundTrip: boolean;
  depAirport: { iataCode: string; city: string };
  arrAirport: { iataCode: string; city: string };
  aircraft: { model: string; manufacturer: string; registrationNum: string };
  _count: { reservations: number; schedules: number; statusHistory: number };
};

export type ScheduleRow = {
  scheduleId: string;
  flightId: string;
  departureDate: Date;
  actualDeparture: Date | null;
  actualArrival: Date | null;
  scheduleStatus: string;
  gate: string | null;
  terminal: string | null;
  daysOfWeek: string | null;
  createdAt: Date;
  updatedAt: Date;
  flight: {
    flightNumber: string;
    schedDeparture: Date;
    depAirport: { iataCode: string; city: string };
    arrAirport: { iataCode: string; city: string };
  };
};

export type StatusHistoryRow = {
  statusHistId: string;
  flightId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string | null;
  changeTime: Date;
  reason: string | null;
  flight: { flightNumber: string; schedDeparture: Date };
  staff: { firstName: string; lastName: string; role: string } | null;
};

// ─── Status badge helper ───────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  BOARDING: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  DELAYED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  DEPARTED: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  ARRIVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

// ─── Flight Actions Cell ───────────────────────────────────────────────────────
function FlightActionsCell({ row }: { row: { original: FlightRow } }) {
  const router = useRouter();

  async function handleStatusUpdate(status: string) {
    const res = await updateFlightStatus({ flightId: row.original.flightId, status: status as never });
    if (res.success) {
      toast.success(`Status updated to ${status}`);
      router.refresh();
    } else {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete flight ${row.original.flightNumber}? This cannot be undone.`)) return;
    const res = await deleteFlight(row.original.flightId);
    if (res.success) {
      toast.success("Flight deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete flight");
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
          <DropdownMenuLabel className="text-xs text-muted-foreground">Flight Management</DropdownMenuLabel>
          <DropdownMenuItem asChild className="text-sm cursor-pointer">
            <Link href={`/staff/flights/${row.original.flightId}/manifest`}>
              View Manifest
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Update Operational Status</DropdownMenuLabel>
          {["SCHEDULED", "BOARDING", "DELAYED", "DEPARTED", "ARRIVED", "CANCELLED"].map((s) => (
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
          onClick={handleDelete}
        >
          Delete Flight
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Flights Columns ───────────────────────────────────────────────────────────
export const flightColumns: ColumnDef<FlightRow>[] = [
  {
    accessorKey: "flightNumber",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Flight <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">{row.original.flightNumber}</span>
    ),
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-mono font-semibold">{row.original.depAirport.iataCode}</span>
        <span className="text-muted-foreground text-xs">→</span>
        <span className="font-mono font-semibold">{row.original.arrAirport.iataCode}</span>
        <span className="text-muted-foreground text-xs hidden lg:inline">
          · {row.original.depAirport.city}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "schedDeparture",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Departure <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{format(new Date(row.original.schedDeparture), "dd MMM yyyy")}</div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(row.original.schedDeparture), "HH:mm")}
        </div>
      </div>
    ),
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
    accessorKey: "basePrice",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Price <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">${Number(row.original.basePrice).toLocaleString()}</span>
    ),
  },
  {
    id: "bookings",
    accessorFn: (row) => row._count.reservations,
    header: "Bookings",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono">{row.original._count.reservations}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <FlightActionsCell row={row} />,
  },
];

// ─── Schedule Columns ──────────────────────────────────────────────────────────
export const scheduleColumns: ColumnDef<ScheduleRow>[] = [
  {
    id: "flight",
    header: "Flight",
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-mono font-bold">{row.original.flight.flightNumber}</span>
        <div className="text-xs text-muted-foreground">
          {row.original.flight.depAirport.iataCode} → {row.original.flight.arrAirport.iataCode}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "departureDate",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{format(new Date(row.original.departureDate), "dd MMM yyyy HH:mm")}</span>
    ),
  },
  {
    accessorKey: "actualDeparture",
    header: "Actual Dep.",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.actualDeparture
          ? format(new Date(row.original.actualDeparture), "HH:mm")
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "gate",
    header: "Gate",
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.gate ?? "—"}</span>
    ),
  },
  {
    accessorKey: "terminal",
    header: "Terminal",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.terminal ?? "—"}</span>
    ),
  },
  {
    accessorKey: "scheduleStatus",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.scheduleStatus} />,
  },
];

// ─── Status History Columns ────────────────────────────────────────────────────
export const statusHistoryColumns: ColumnDef<StatusHistoryRow>[] = [
  {
    id: "flight",
    header: "Flight",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">{row.original.flight.flightNumber}</span>
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
    cell: ({ row }) => (
      <span className="text-sm">{format(new Date(row.original.changeTime), "dd MMM yyyy HH:mm")}</span>
    ),
  },
  {
    id: "change",
    header: "Change",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={row.original.oldStatus} />
        <span className="text-muted-foreground text-xs">→</span>
        <StatusBadge status={row.original.newStatus} />
      </div>
    ),
  },
  {
    id: "changedBy",
    header: "Changed By",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.staff
          ? `${row.original.staff.firstName} ${row.original.staff.lastName}`
          : <span className="text-muted-foreground">System</span>}
      </span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.reason ?? "—"}</span>
    ),
  },
];
