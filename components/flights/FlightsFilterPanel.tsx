"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type FlightFilters = {
  maxPrice: number;
  statuses: string[];
  classes: string[];
  sortBy: "price_asc" | "price_desc" | "departure_asc" | "duration_asc";
};

const DEFAULT_FILTERS: FlightFilters = {
  maxPrice: 10000,
  statuses: [],
  classes: [],
  sortBy: "departure_asc",
};

const STATUSES = [
  { value: "SCHEDULED", label: "Scheduled", color: "bg-green-500/15 text-green-600 border-green-500/30" },
  { value: "BOARDING", label: "Boarding", color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  { value: "DELAYED", label: "Delayed", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  { value: "DEPARTED", label: "Departed", color: "bg-slate-500/15 text-slate-600 border-slate-500/30" },
  { value: "ARRIVED", label: "Arrived", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
];

const CLASSES = [
  { value: "ECONOMY", label: "Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First" },
];

const SORT_OPTIONS = [
  { value: "departure_asc", label: "Earliest Departure" },
  { value: "price_asc", label: "Lowest Price" },
  { value: "price_desc", label: "Highest Price" },
  { value: "duration_asc", label: "Shortest Flight" },
] as const;

interface FlightsFilterPanelProps {
  filters: FlightFilters;
  onChange: (f: FlightFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export { DEFAULT_FILTERS };

export function FlightsFilterPanel({ filters, onChange, totalCount, filteredCount }: FlightsFilterPanelProps) {
  const activeFilterCount =
    filters.statuses.length +
    filters.classes.length +
    (filters.maxPrice < 10000 ? 1 : 0);

  const reset = () => onChange(DEFAULT_FILTERS);

  const toggleStatus = (v: string) =>
    onChange({
      ...filters,
      statuses: filters.statuses.includes(v)
        ? filters.statuses.filter((s) => s !== v)
        : [...filters.statuses, v],
    });

  const toggleClass = (v: string) =>
    onChange({
      ...filters,
      classes: filters.classes.includes(v)
        ? filters.classes.filter((c) => c !== v)
        : [...filters.classes, v],
    });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="rounded-full px-1.5 py-0.5 text-[10px] h-4 min-w-4 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span>{" "}
          flights
        </p>

        {/* Sort By */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2.5">
            Sort By
          </p>
          <div className="space-y-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, sortBy: opt.value })}
                className={cn(
                  "w-full text-left text-sm px-3 py-2 rounded-xl transition-colors duration-150",
                  filters.sortBy === opt.value
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Price */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Max Price
            </p>
            <span className="text-sm font-semibold text-foreground">
              {filters.maxPrice >= 10000 ? "Any" : `$${filters.maxPrice.toLocaleString()}`}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={10000}
            step={50}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>$100</span>
            <span>$10,000+</span>
          </div>
        </div>

        {/* Flight Status */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2.5">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => toggleStatus(status.value)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150",
                  filters.statuses.includes(status.value)
                    ? status.color + " ring-1 ring-inset ring-current"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seat Class */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2.5">
            Seat Class
          </p>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((cls) => (
              <button
                key={cls.value}
                onClick={() => toggleClass(cls.value)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150",
                  filters.classes.includes(cls.value)
                    ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-inset ring-primary/30"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
