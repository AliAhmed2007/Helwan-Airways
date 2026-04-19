"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import {
  Plane,
  Search,
  ArrowRight,
  MapPin,
  TrendingUp,
  Clock,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAirports } from "@/lib/actions/flights";

type Airport = {
  airportId: string;
  iataCode: string;
  airportName: string;
  city: string;
  country: string;
};

const QUICK_ROUTES = [
  { from: "CAI", fromCity: "Cairo", to: "DXB", toCity: "Dubai", icon: "🇦🇪" },
  { from: "CAI", fromCity: "Cairo", to: "LHR", toCity: "London", icon: "🇬🇧" },
  { from: "CAI", fromCity: "Cairo", to: "IST", toCity: "Istanbul", icon: "🇹🇷" },
  { from: "CAI", fromCity: "Cairo", to: "CDG", toCity: "Paris", icon: "🇫🇷" },
  { from: "CAI", fromCity: "Cairo", to: "JFK", toCity: "New York", icon: "🇺🇸" },
  { from: "CAI", fromCity: "Cairo", to: "DOH", toCity: "Doha", icon: "🇶🇦" },
];

interface FlightCommandSearchProps {
  open: boolean;
  onClose: () => void;
}

export function FlightCommandSearch({ open, onClose }: FlightCommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [step, setStep] = useState<"from" | "to">("from");
  const [selectedFrom, setSelectedFrom] = useState<Airport | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  useEffect(() => {
    getAirports().then((res) => {
      if (res.success) setAirports(res.data);
    });
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setStep("from");
      setSelectedFrom(null);
      setActiveIndex(0);
    }
  }, [open]);

  const filteredAirports = query.trim()
    ? airports
        .filter(
          (a) =>
            a.city.toLowerCase().includes(query.toLowerCase()) ||
            a.iataCode.toLowerCase().includes(query.toLowerCase()) ||
            a.airportName.toLowerCase().includes(query.toLowerCase()) ||
            a.country.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 7)
    : airports.slice(0, 7);

  const navigateToFlight = useCallback(
    (fromIata: string, toIata: string) => {
      const params = new URLSearchParams({
        from: fromIata,
        to: toIata,
        date: tomorrow,
        passengers: "1",
        tripType: "one-way",
      });
      router.push(`/flights?${params.toString()}`);
      onClose();
    },
    [router, tomorrow, onClose]
  );

  const handleSelectAirport = useCallback(
    (airport: Airport) => {
      if (step === "from") {
        setSelectedFrom(airport);
        setStep("to");
        setQuery("");
        setActiveIndex(0);
      } else {
        navigateToFlight(selectedFrom!.iataCode, airport.iataCode);
      }
    },
    [step, selectedFrom, navigateToFlight]
  );

  const showQuickRoutes = step === "from" && !query.trim();
  const listItems = showQuickRoutes ? QUICK_ROUTES : filteredAirports;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, listItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (showQuickRoutes) {
          const route = QUICK_ROUTES[activeIndex];
          if (route) navigateToFlight(route.from, route.to);
        } else {
          const airport = filteredAirports[activeIndex];
          if (airport) handleSelectAirport(airport);
        }
      } else if (e.key === "Escape") {
        if (step === "to") {
          setStep("from");
          setSelectedFrom(null);
          setQuery("");
        } else {
          onClose();
        }
      } else if (e.key === "Backspace" && query === "" && step === "to") {
        setStep("from");
        setSelectedFrom(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, step, query, activeIndex, showQuickRoutes, listItems.length, filteredAirports, handleSelectAirport, navigateToFlight, onClose]);

  useEffect(() => setActiveIndex(0), [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl shadow-black/20 dark:shadow-black/60">

              {/* Step breadcrumb */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <button
                  onClick={() => {
                    if (step === "to") {
                      setStep("from");
                      setSelectedFrom(null);
                      setQuery("");
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 transition-all",
                    step === "from"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
                  )}
                >
                  <MapPin className="h-3 w-3" />
                  {selectedFrom ? `From: ${selectedFrom.iataCode}` : "Origin"}
                </button>

                {selectedFrom && (
                  <>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 bg-primary text-primary-foreground">
                      <MapPin className="h-3 w-3" />
                      Destination
                    </span>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="ml-auto rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Input */}
              <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  id="flight-command-input"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    step === "from"
                      ? "Search departure city or airport…"
                      : `From ${selectedFrom?.city} → search destination…`
                  }
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-px rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {showQuickRoutes ? (
                  <>
                    <div className="flex items-center gap-1.5 px-4 py-1.5">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Popular Routes from Cairo
                      </span>
                    </div>
                    {QUICK_ROUTES.map((route, i) => (
                      <button
                        key={`${route.from}-${route.to}`}
                        onClick={() => navigateToFlight(route.from, route.to)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                          i === activeIndex
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <span className="text-base">{route.icon}</span>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="font-mono text-xs font-bold text-foreground">{route.from}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="font-mono text-xs font-bold text-foreground">{route.to}</span>
                          <span className="text-muted-foreground truncate">
                            · {route.fromCity} → {route.toCity}
                          </span>
                        </div>
                        <span className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Tomorrow
                        </span>
                      </button>
                    ))}
                  </>
                ) : filteredAirports.length > 0 ? (
                  <>
                    <div className="flex items-center gap-1.5 px-4 py-1.5">
                      <Plane className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        {step === "from" ? "Select Origin" : "Select Destination"}
                      </span>
                    </div>
                    {filteredAirports.map((airport, i) => (
                      <button
                        key={airport.airportId}
                        onClick={() => handleSelectAirport(airport)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                          i === activeIndex
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">{airport.city}</div>
                            <div className="text-xs text-muted-foreground truncate">
                            {airport.airportName} · {airport.country}
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-bold text-foreground bg-muted/80 rounded-md px-1.5 py-0.5">
                          {airport.iataCode}
                        </span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No airports matching &quot;{query}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="border-t border-border/40 px-4 py-2.5 flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">esc</kbd>
                  {step === "to" ? "back" : "close"}
                </span>
                {step === "to" && selectedFrom && (
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    Flying from{" "}
                    <span className="font-mono font-bold text-foreground">{selectedFrom.iataCode}</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
