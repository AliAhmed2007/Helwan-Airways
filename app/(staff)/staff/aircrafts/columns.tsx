"use client";

import { ColumnDef } from "@tanstack/react-table";
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
import { updateAircraftStatus, deleteAircraft } from "@/lib/actions/staff";
import { useRouter } from "next/navigation";

export type AircraftRow = {
  aircraftId: string;
  registrationNum: string;
  model: string;
  manufacturer: string;
  totalSeats: number;
  firstClassSeats: number;
  businessSeats: number;
  economySeats: number;
  status: string;
  createdAt: Date;
  _count: { flights: number; seats: number };
  flights: { flightId: string; flightNumber: string; status: string }[];
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600",
  MAINTENANCE: "bg-amber-500/10 text-amber-600",
  RETIRED: "bg-red-500/10 text-red-600",
};

function AircraftActionsCell({ row }: { row: { original: AircraftRow } }) {
  const router = useRouter();

  async function handleStatusUpdate(status: string) {
    const res = await updateAircraftStatus(row.original.aircraftId, status);
    if (res.success) {
      toast.success(`Aircraft status updated to ${status}`);
      router.refresh();
    } else {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete aircraft ${row.original.registrationNum}?`)) return;
    const res = await deleteAircraft(row.original.aircraftId);
    if (res.success) {
      toast.success("Aircraft deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete aircraft");
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
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Update Status</DropdownMenuLabel>
          {["ACTIVE", "MAINTENANCE", "RETIRED"].map((s) => (
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
          Delete Aircraft
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<AircraftRow>[] = [
  {
    accessorKey: "registrationNum",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Registration <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-mono font-bold text-sm">{row.original.registrationNum}</span>,
  },
  {
    id: "model",
    header: "Model",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">{row.original.model}</div>
        <div className="text-xs text-muted-foreground">{row.original.manufacturer}</div>
      </div>
    ),
  },
  {
    accessorKey: "totalSeats",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Total Seats <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.totalSeats}</span>,
  },
  {
    id: "seatBreakdown",
    header: "Seat Classes",
    cell: ({ row }) => (
      <div className="flex gap-1.5 flex-wrap">
        {row.original.firstClassSeats > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600">
            F:{row.original.firstClassSeats}
          </Badge>
        )}
        {row.original.businessSeats > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/30 text-violet-600">
            B:{row.original.businessSeats}
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-600">
          E:{row.original.economySeats}
        </Badge>
      </div>
    ),
  },
  {
    id: "flights",
    accessorFn: (row) => row._count.flights,
    header: "Flights",
    cell: ({ row }) => <Badge variant="secondary" className="font-mono">{row.original._count.flights}</Badge>,
  },
  {
    id: "activeFlights",
    header: "Active Flights",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        {row.original.flights.length > 0 ? (
          row.original.flights.slice(0, 3).map((f) => (
            <span key={f.flightId} className="text-xs font-mono text-muted-foreground">{f.flightNumber}</span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        )}
      </div>
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
    id: "actions",
    header: "",
    cell: ({ row }) => <AircraftActionsCell row={row} />,
  },
];
