"use client";

import { useState, useTransition } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { checkInPassenger, undoCheckIn, updateBaggageWeight } from "@/lib/actions/checkin";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type PassengerRow = {
  id: string;
  bookingRef: string;
  firstName: string;
  lastName: string;
  seatId: string | null;
  checkedBags: number;
  baggageWeight: number | string | null;
  mealPreference: string;
  checkInStatus: "NOT_CHECKED_IN" | "CHECKED_IN";
  boardingGroup: string | null;
  seat: {
    seatNumber: string;
    class: string;
  } | null;
};

interface ManifestTableProps {
  passengers: PassengerRow[];
}

export function ManifestTable({ passengers }: ManifestTableProps) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPending, startTransition] = useTransition();
  const [baggageDialog, setBaggageDialog] = useState<{
    open: boolean;
    passengerId: string;
    name: string;
    currentWeight: number;
  } | null>(null);
  const [baggageWeight, setBaggageWeight] = useState("");

  const handleCheckIn = (passengerId: string, currentStatus: string) => {
    startTransition(async () => {
      if (currentStatus === "CHECKED_IN") {
        const result = await undoCheckIn(passengerId);
        if (result.success) {
          toast.success("Check-in reverted");
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to revert check-in");
        }
      } else {
        const result = await checkInPassenger({ bookingPassengerId: passengerId });
        if (result.success) {
          toast.success("Passenger checked in successfully");
          router.refresh();
        } else {
          toast.error(result.error ?? "Check-in failed");
        }
      }
    });
  };

  const handleBaggageUpdate = async () => {
    if (!baggageDialog) return;
    const weight = parseFloat(baggageWeight);
    if (isNaN(weight) || weight < 0 || weight > 50) {
      toast.error("Please enter a valid weight (0–50 kg)");
      return;
    }

    startTransition(async () => {
      const result = await updateBaggageWeight({
        bookingPassengerId: baggageDialog.passengerId,
        baggageWeight: weight,
      });
      if (result.success) {
        toast.success("Baggage weight updated");
        setBaggageDialog(null);
        setBaggageWeight("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update baggage weight");
      }
    });
  };

  const columns: ColumnDef<PassengerRow>[] = [
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Passenger <ArrowUpDown className="h-3 w-3 opacity-50" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.bookingRef}</div>
        </div>
      ),
    },
    {
      id: "seat",
      header: () => <span className="text-xs">Seat</span>,
      cell: ({ row }) => (
        <div>
          <div className="font-mono font-semibold text-sm">
            {row.original.seat?.seatNumber ?? "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.seat?.class ?? ""}
          </div>
        </div>
      ),
    },
    {
      id: "bags",
      header: () => <span className="text-xs">Bags</span>,
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.original.checkedBags}</div>
          {row.original.baggageWeight && (
            <div className="text-xs text-muted-foreground">
              {Number(row.original.baggageWeight).toFixed(1)} kg
            </div>
          )}
        </div>
      ),
    },
    {
      id: "meal",
      header: () => <span className="text-xs">Meal</span>,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground capitalize">
          {row.original.mealPreference.toLowerCase().replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "boardingGroup",
      header: () => <span className="text-xs">Group</span>,
      cell: ({ row }) => (
        <span className="font-semibold text-sm">{row.original.boardingGroup ?? "—"}</span>
      ),
    },
    {
      accessorKey: "checkInStatus",
      header: () => <span className="text-xs">Check-In</span>,
      cell: ({ row }) => {
        const isCheckedIn = row.original.checkInStatus === "CHECKED_IN";
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              isCheckedIn
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                : "bg-muted text-muted-foreground border-border/50"
            )}
          >
            {isCheckedIn ? "Checked In" : "Pending"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="text-xs">Actions</span>,
      cell: ({ row }) => {
        const isCheckedIn = row.original.checkInStatus === "CHECKED_IN";
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant={isCheckedIn ? "outline" : "default"}
              size="sm"
              className="h-7 text-xs rounded-lg gap-1"
              onClick={() => handleCheckIn(row.original.id, row.original.checkInStatus)}
              disabled={isPending}
              id={`checkin-btn-${row.original.id}`}
            >
              {isCheckedIn ? (
                <>
                  <Circle className="h-3 w-3" /> Undo
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Check In
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setBaggageDialog({
                  open: true,
                  passengerId: row.original.id,
                  name: `${row.original.firstName} ${row.original.lastName}`,
                  currentWeight: Number(row.original.baggageWeight) || 0,
                });
                setBaggageWeight(String(Number(row.original.baggageWeight) || ""));
              }}
              aria-label="Update baggage weight"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: passengers,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const checkedInCount = passengers.filter((p) => p.checkInStatus === "CHECKED_IN").length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search passengers..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 rounded-xl h-9"
            id="manifest-search"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{checkedInCount}</span> of{" "}
          <span className="font-semibold text-foreground">{passengers.length}</span> checked in
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
                  className={cn(
                    "border-border/30 transition-colors",
                    row.original.checkInStatus === "CHECKED_IN"
                      ? "hover:bg-green-500/5 bg-green-500/[0.03]"
                      : "hover:bg-muted/30"
                  )}
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
                  No passengers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} passenger(s)
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
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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

      {/* Baggage weight dialog */}
      <Dialog
        open={baggageDialog?.open ?? false}
        onOpenChange={(open) => !open && setBaggageDialog(null)}
      >
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Update Baggage Weight</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">{baggageDialog?.name}</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
              <Input
                type="number"
                min={0}
                max={50}
                step={0.1}
                value={baggageWeight}
                onChange={(e) => setBaggageWeight(e.target.value)}
                placeholder="e.g. 23.5"
                className="rounded-xl"
                id="baggage-weight-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setBaggageDialog(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleBaggageUpdate}
              disabled={isPending}
              id="save-baggage-weight"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
