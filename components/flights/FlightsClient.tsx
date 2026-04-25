"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInMinutes, format } from "date-fns";
import { Plane, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { FlightCard } from "@/components/flights/FlightCard";
import { FlightsFilterPanel, DEFAULT_FILTERS, type FlightFilters } from "@/components/flights/FlightsFilterPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

// The schedule type returned from getAllPublicFlights
type ScheduleWithFlight = {
  scheduleId: string;
  flightId: string;
  departureDate: Date | string;
  scheduleStatus: string;
  gate: string | null;
  terminal: string | null;
  flight: {
    flightId: string;
    flightNumber: string;
    schedDeparture: Date | string;
    schedArrival: Date | string;
    status: string;
    isRoundTrip: boolean;
    returnDate: Date | string | null;
    basePrice: string | number;
    depAirport: { iataCode: string; city: string; airportName: string };
    arrAirport: { iataCode: string; city: string; airportName: string };
    aircraft: {
      model: string;
      manufacturer: string;
      totalSeats: number;
      firstClassSeats: number;
      businessSeats: number;
      economySeats: number;
      seats: { seatId: string; class: string; seatNumber: string; extraPrice: string | number; reservations: { reservationId: string }[] }[];
    };
  };
};

interface FlightsClientProps {
  schedules: ScheduleWithFlight[];
}

// ─── Pagination bar ─────────────────────────────────────────────────────────
function PaginationBar({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center justify-center gap-1.5 mt-8"
    >
      {/* Prev */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={cn(
          "flex items-center justify-center h-9 w-9 rounded-xl border text-sm transition-all duration-150",
          page === 1
            ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
            : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex items-center justify-center h-9 w-9 text-sm text-muted-foreground select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded-xl border text-sm font-medium transition-all duration-150",
              p === page
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "flex items-center justify-center h-9 w-9 rounded-xl border text-sm transition-all duration-150",
          page === totalPages
            ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
            : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function FlightsClient({ schedules }: FlightsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Read search params
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const passengersStr = searchParams.get("passengers") ?? "1";
  const passengers = parseInt(passengersStr);
  const hasSearch = !!(from && to);

  // Filtered + sorted results
  const filtered = useMemo(() => {
    let result = schedules;

    if (hasSearch) {
      result = result.filter((s) => {
        const depMatch = s.flight.depAirport.iataCode.toLowerCase() === from.toLowerCase();
        const arrMatch = s.flight.arrAirport.iataCode.toLowerCase() === to.toLowerCase();
        return depMatch && arrMatch;
      });
    }

    if (filters.departureDate) {
      result = result.filter((s) => format(new Date(s.departureDate), "yyyy-MM-dd") === filters.departureDate);
    }

    if (filters.statuses.length > 0) {
      result = result.filter((s) => filters.statuses.includes(s.flight.status));
    }

    if (filters.classes.length > 0) {
      result = result.filter((s) => {
        const seats = s.flight.aircraft.seats;
        return filters.classes.some((cls) =>
          seats.some((seat) => seat.class === cls && seat.reservations.length === 0)
        );
      });
    }

    if (filters.maxPrice < 10000) {
      result = result.filter((s) => Number(s.flight.basePrice) <= filters.maxPrice);
    }

    if (filters.selectableOnly) {
      result = result.filter((s) => {
        const availableSeats = s.flight.aircraft.seats.filter((seat) => seat.reservations.length === 0).length;
        return availableSeats >= passengers;
      });
    }

    if (filters.roundTripOnly) {
      result = result.filter((s) => s.flight.isRoundTrip);
    }

    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case "price_asc":
          return Number(a.flight.basePrice) - Number(b.flight.basePrice);
        case "price_desc":
          return Number(b.flight.basePrice) - Number(a.flight.basePrice);
        case "duration_asc": {
          const dA = differenceInMinutes(new Date(a.flight.schedArrival), new Date(a.flight.schedDeparture));
          const dB = differenceInMinutes(new Date(b.flight.schedArrival), new Date(b.flight.schedDeparture));
          return dA - dB;
        }
        case "departure_asc":
        default:
          return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
      }
    });

    return result;
  }, [schedules, from, to, hasSearch, filters]);

  // Reset to page 1 whenever filters or search change
  useEffect(() => {
    setPage(1);
  }, [filters, from, to]);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`/flights?${params.toString()}`, { scroll: false });
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePage = (p: number) => {
    setPage(p);
    // Scroll results area back to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:block sticky top-24">
        <FlightsFilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={handleReset}
          totalCount={schedules.length}
          filteredCount={filtered.length}
          hasSearch={hasSearch}
        />
      </aside>

      {/* ─── Results ─── */}
      <div className="min-w-0">
        {/* Count row + mobile filter toggle */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              flight{filtered.length !== 1 ? "s" : ""} found
              {hasSearch && (
                <span className="ml-1 text-muted-foreground">
                  · {from} → {to}
                </span>
              )}
              {filtered.length > 0 && (
                <span className="ml-1 text-muted-foreground">
                  · page {page} of {totalPages}
                </span>
              )}
            </p>
            {hasSearch && (
              <Button
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-xs rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={handleClearSearch}
              >
                Clear Route
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden rounded-xl gap-2"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </Button>
        </div>

        {/* Flight list */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plane className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Flights Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {hasSearch
                  ? `No flights from ${from} to ${to} match your filters. Try adjusting your search or clearing the route.`
                  : "No flights match your current filters. Try resetting them."}
              </p>
              <div className="flex gap-3 mt-6">
                {hasSearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={handleClearSearch}
                  >
                    <X className="h-3.5 w-3.5 mr-2" />
                    Clear Route
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleReset}
                >
                  <X className="h-3.5 w-3.5 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key={`page-${page}`} className="space-y-3">
              {paginated.map((schedule, index) => (
                <FlightCard
                  key={schedule.scheduleId}
                  flight={{
                    ...schedule.flight,
                    basePrice: Number(schedule.flight.basePrice),
                    departureDate: schedule.departureDate,
                    gate: schedule.gate,
                    isRoundTrip: schedule.flight.isRoundTrip,
                    returnDate: schedule.flight.returnDate,
                  }}
                  passengers={passengers}
                  scheduleId={schedule.scheduleId}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <PaginationBar page={page} totalPages={totalPages} onPage={handlePage} />
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-[320px] bg-background overflow-y-auto lg:hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filter Flights</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <FlightsFilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleReset}
                  totalCount={schedules.length}
                  filteredCount={filtered.length}
                  hasSearch={hasSearch}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
