"use client";

import { useState, useTransition } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateFlightStatus } from "@/lib/actions/flights";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FlightStatus = "SCHEDULED" | "BOARDING" | "DELAYED" | "DEPARTED" | "ARRIVED" | "CANCELLED";

type FlightRow = {
  id: string;
  flightNumber: string;
  departureTime: string | Date;
  arrivalTime: string | Date;
  status: FlightStatus;
  gate: string | null;
  departureAirport: { iataCode: string; city: string };
  arrivalAirport: { iataCode: string; city: string };
  _count: { bookings: number };
  totalSeats: number;
};

const STATUS_CONFIG: Record<FlightStatus, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  BOARDING: { label: "Boarding", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  DELAYED: { label: "Delayed", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  DEPARTED: { label: "Departed", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  ARRIVED: { label: "Arrived", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

const ALL_STATUSES: FlightStatus[] = ["SCHEDULED", "BOARDING", "DELAYED", "DEPARTED", "ARRIVED", "CANCELLED"];

interface FlightsTableProps {
  flights: FlightRow[];
}

export function FlightsTable({ flights }: FlightsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: "departureTime", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (flightId: string, status: FlightStatus) => {
    startTransition(async () => {
      const result = await updateFlightStatus({ flightId, status });
      if (result.success) {
        toast.success(`Flight status updated to ${STATUS_CONFIG[status].label}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update status");
      }
    });
  };

  const columns: ColumnDef<FlightRow>[] = [
    {
      accessorKey: "flightNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Flight # <ArrowUpDown className="h-3 w-3 opacity-50" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-sm">{row.getValue("flightNumber")}</span>
      ),
    },
    {
      id: "route",
      header: () => <span className="text-xs">Route</span>,
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.departureAirport.iataCode}
          <span className="text-muted-foreground mx-1">→</span>
          {row.original.arrivalAirport.iataCode}
        </span>
      ),
    },
    {
      accessorKey: "departureTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Departure <ArrowUpDown className="h-3 w-3 opacity-50" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium">
            {format(new Date(row.getValue("departureTime")), "HH:mm")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(row.getValue("departureTime")), "dd MMM")}
          </div>
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      id: "gate",
      header: () => <span className="text-xs">Gate</span>,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.gate ?? <span className="text-muted-foreground">TBD</span>}</span>
      ),
    },
    {
      id: "occupancy",
      header: () => <span className="text-xs">Passengers</span>,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original._count.bookings}
          <span className="text-muted-foreground text-xs"> booked</span>
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: () => <span className="text-xs">Status</span>,
      cell: ({ row }) => {
        const status = row.getValue("status") as FlightStatus;
        const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.SCHEDULED;
        return (
          <Badge variant="outline" className={cn("text-xs", cfg.className)}>
            {cfg.label}
          </Badge>
        );
      },
      filterFn: "equals",
    },
    {
      id: "actions",
      header: () => <span className="text-xs">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Select
            defaultValue={row.original.status}
            onValueChange={(val) =>
              handleStatusUpdate(row.original.id, val as FlightStatus)
            }
            disabled={isPending}
          >
            <SelectTrigger className="h-7 text-xs rounded-lg w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.push(`/staff/flights/${row.original.id}/manifest`)}
            aria-label={`View manifest for ${row.original.flightNumber}`}
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ];

  // Apply status filter
  const filteredFlights =
    statusFilter === "all"
      ? flights
      : flights.filter((f) => f.status === statusFilter);

  const table = useReactTable({
    data: filteredFlights,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flights..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 rounded-xl h-9"
            id="flights-search"
          />
        </div>

        {/* Status facet filter */}
        <div className="flex flex-wrap gap-2">
          {["all", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border",
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border/60 hover:text-foreground hover:border-border"
              )}
            >
              {s === "all"
                ? "All"
                : STATUS_CONFIG[s as FlightStatus]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs h-10 px-4 bg-muted/30">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/30 hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No flights found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} flight(s) total
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
