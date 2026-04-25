"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type FlightFilters = {
  maxPrice: number;
  statuses: string[];
  classes: string[];
  sortBy: "price_asc" | "price_desc" | "departure_asc" | "duration_asc";
  selectableOnly: boolean;
  roundTripOnly: boolean;
  departureDate: string | null;
};

const DEFAULT_FILTERS: FlightFilters = {
  maxPrice: 3000,
  statuses: [],
  classes: [],
  sortBy: "departure_asc",
  selectableOnly: false,
  roundTripOnly: false,
  departureDate: null,
};

const STATUSES = [
  { value: "SCHEDULED", label: "Scheduled", color: "bg-green-500/15 text-green-600 border-green-500/30" },
  { value: "DELAYED", label: "Delayed", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
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
  onReset?: () => void;
  totalCount: number;
  filteredCount: number;
  hasSearch?: boolean;
}

export { DEFAULT_FILTERS };

export function FlightsFilterPanel({ filters, onChange, onReset, totalCount, filteredCount, hasSearch }: FlightsFilterPanelProps) {
  const activeFilterCount =
    filters.statuses.length +
    filters.classes.length +
    (filters.maxPrice < 3000 ? 1 : 0) +
    (filters.selectableOnly ? 1 : 0) +
    (filters.roundTripOnly ? 1 : 0) +
    (filters.departureDate ? 1 : 0);

  const showReset = activeFilterCount > 0 || hasSearch;

  const reset = () => {
    if (onReset) onReset();
    else onChange(DEFAULT_FILTERS);
  };

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
        {showReset && (
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

        {/* Departure Date */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2.5">
            Departure Date
          </p>
          <input
            type="date"
            className="w-full text-sm px-3 py-2 rounded-xl border border-border/50 bg-background text-foreground transition-all duration-150 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            value={filters.departureDate || ""}
            onChange={(e) => onChange({ ...filters, departureDate: e.target.value || null })}
          />
        </div>

        {/* Max Price */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Max Price
            </p>
            <span className="text-sm font-semibold text-foreground">
              {filters.maxPrice >= 3000 ? "Any" : `$${filters.maxPrice.toLocaleString()}`}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={3000}
            step={50}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>$100</span>
            <span>$3,000+</span>
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

        {/* Type / Availability */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2.5">
            Flight Options
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onChange({ ...filters, selectableOnly: !filters.selectableOnly })}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border font-medium transition-all duration-150 w-full text-left flex items-center justify-between",
                filters.selectableOnly
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-primary/30"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              Selectable Flights Only
              <div className={cn(
                "w-2 h-2 rounded-full",
                filters.selectableOnly ? "bg-primary-foreground/80" : "bg-transparent"
              )} />
            </button>
            <button
              onClick={() => onChange({ ...filters, roundTripOnly: !filters.roundTripOnly })}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border font-medium transition-all duration-150 w-full text-left flex items-center justify-between",
                filters.roundTripOnly
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-primary/30"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              Round Trip Only
              <div className={cn(
                "w-2 h-2 rounded-full",
                filters.roundTripOnly ? "bg-primary-foreground/80" : "bg-transparent"
              )} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
