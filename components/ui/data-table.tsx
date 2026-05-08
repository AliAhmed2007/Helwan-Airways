"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  GlobalFilterTableState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Filter config type ────────────────────────────────────────────────────────
export interface FilterOption {
  label: string;
  value: string;
}

export interface TableFilter {
  /** The column accessorKey to filter on */
  columnId: string;
  /** Display label shown above the pills */
  label: string;
  /** All possible values for this filter */
  options: FilterOption[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Legacy single-key search (still supported) */
  searchKey?: string;
  searchPlaceholder?: string;
  /** Structured filter configs (select-style pill filters) */
  filters?: TableFilter[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  filters = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: { pagination: { pageSize: 20 } },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getColumnFilter(columnId: string): string {
    return (table.getColumn(columnId)?.getFilterValue() as string) ?? "";
  }

  function setColumnFilter(columnId: string, value: string) {
    table.getColumn(columnId)?.setFilterValue(value || undefined);
  }

  function clearAll() {
    setGlobalFilter("");
    table.resetColumnFilters();
  }

  const hasActiveFilters =
    globalFilter ||
    (searchKey && table.getColumn(searchKey)?.getFilterValue()) ||
    filters.some((f) => getColumnFilter(f.columnId));

  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = data.length;

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Global search + count + clear */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Global search always shown if no specific searchKey */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder ?? "Search all columns…"}
              value={searchKey
                ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
                : globalFilter}
              onChange={(e) => {
                if (searchKey) {
                  table.getColumn(searchKey)?.setFilterValue(e.target.value);
                } else {
                  setGlobalFilter(e.target.value);
                }
              }}
              className="pl-9 h-9 bg-card border-border/50 rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground tabular-nums">
              {filteredCount === totalCount
                ? `${totalCount} row${totalCount !== 1 ? "s" : ""}`
                : `${filteredCount} of ${totalCount}`}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <X className="h-3 w-3" /> Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Pill filter groups */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {filters.map((filter) => {
              const active = getColumnFilter(filter.columnId);
              return (
                <div key={filter.columnId} className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                    {filter.label}:
                  </span>
                  {/* "All" pill */}
                  <button
                    onClick={() => setColumnFilter(filter.columnId, "")}
                    className={cn(
                      "inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium transition-colors border",
                      !active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                  {filter.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setColumnFilter(
                          filter.columnId,
                          active === opt.value ? "" : opt.value
                        )
                      }
                      className={cn(
                        "inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium transition-colors border",
                        active === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border/50 hover:bg-muted/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results
                  {hasActiveFilters && (
                    <span className="text-xs">
                      {" "}— try{" "}
                      <button
                        className="underline text-primary"
                        onClick={clearAll}
                      >
                        clearing filters
                      </button>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border/50 text-muted-foreground hover:text-foreground h-7 px-3 text-xs"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border/50 text-muted-foreground hover:text-foreground h-7 px-3 text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
