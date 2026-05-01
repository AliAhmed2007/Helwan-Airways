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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteAirport } from "@/lib/actions/staff";
import { useRouter } from "next/navigation";

export type AirportRow = {
  airportId: string;
  iataCode: string;
  airportName: string;
  city: string;
  country: string;
  timezone: string;
  createdAt: Date;
  _count: { departingFlights: number; arrivingFlights: number };
};

function AirportActionsCell({ row }: { row: { original: AirportRow } }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete airport ${row.original.iataCode} (${row.original.airportName})?`)) return;
    const res = await deleteAirport(row.original.airportId);
    if (res.success) {
      toast.success("Airport deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete airport. It may have associated flights.");
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
          className="text-red-600 focus:text-red-600 text-sm"
          onClick={handleDelete}
        >
          Delete Airport
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<AirportRow>[] = [
  {
    accessorKey: "iataCode",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        IATA <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-mono font-bold text-sm">{row.original.iataCode}</span>,
  },
  {
    accessorKey: "airportName",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Airport <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.airportName}</span>,
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        City <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm">{row.original.city}</span>,
  },
  {
    accessorKey: "country",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Country <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm">{row.original.country}</span>,
  },
  {
    accessorKey: "timezone",
    header: "Timezone",
    cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.timezone}</span>,
  },
  {
    id: "departures",
    accessorFn: (row) => row._count.departingFlights,
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Departures <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <Badge variant="secondary" className="font-mono">{row.original._count.departingFlights}</Badge>,
  },
  {
    id: "arrivals",
    accessorFn: (row) => row._count.arrivingFlights,
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Arrivals <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => <Badge variant="secondary" className="font-mono">{row.original._count.arrivingFlights}</Badge>,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <AirportActionsCell row={row} />,
  },
];
