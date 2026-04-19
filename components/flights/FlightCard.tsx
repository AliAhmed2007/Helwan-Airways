"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Plane,
  Wifi,
  Utensils,
  Luggage,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, differenceInMinutes } from "date-fns";

type Airport = { iataCode: string; city: string; airportName: string };

type Seat = { seatId: string; class: string; reservations: { reservationId: string }[] };

type Flight = {
  flightId: string;
  flightNumber: string;
  schedDeparture: Date | string;
  schedArrival: Date | string;
  status: string;
  basePrice: number | string;
  depAirport: Airport;
  arrAirport: Airport;
  aircraft: {
    model: string;
    manufacturer: string;
    totalSeats: number;
    seats: Seat[];
  };
  // schedule-level override dates (from FlightSchedule)
  departureDate?: Date | string;
  gate?: string | null;
};

interface FlightCardProps {
  flight: Flight;
  passengers: number;
  scheduleId?: string;
  index?: number;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  BOARDING: { label: "Boarding", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  DELAYED: { label: "Delayed", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  DEPARTED: { label: "Departed", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  ARRIVED: { label: "Arrived", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

function formatDuration(depTime: Date | string, arrTime: Date | string): string {
  const dep = new Date(depTime);
  const arr = new Date(arrTime);
  const mins = differenceInMinutes(arr, dep);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function FlightCard({ flight, passengers, scheduleId, index = 0 }: FlightCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const dep = new Date(flight.departureDate ?? flight.schedDeparture);
  const arr = new Date(flight.schedArrival);
  const availableEconomy = flight.aircraft.seats.filter((s) => s.class === "ECONOMY" && s.reservations.length === 0).length;
  const availableBusiness = flight.aircraft.seats.filter((s) => s.class === "BUSINESS" && s.reservations.length === 0).length;
  const availableFirst = flight.aircraft.seats.filter((s) => s.class === "FIRST" && s.reservations.length === 0).length;

  const availableSeats = flight.aircraft.seats.filter((s) => s.reservations.length === 0).length;
  const occupancyPct = Math.round(
    ((flight.aircraft.totalSeats - availableSeats) / flight.aircraft.totalSeats) * 100
  );
  const status = STATUS_CONFIG[flight.status] ?? STATUS_CONFIG.SCHEDULED;
  const totalPrice = Number(flight.basePrice) * passengers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      layout
      className="group rounded-2xl border border-border/50 bg-card hover:border-border hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Main row */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Flight number + status */}
          <div className="flex items-center gap-3 min-w-[120px]">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plane className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-mono font-semibold text-sm">{flight.flightNumber}</div>
              <div className="text-xs text-muted-foreground">{flight.aircraft.model}</div>
            </div>
          </div>

          {/* Route timeline */}
          <div className="flex-1 flex items-center gap-3 sm:gap-4">
            {/* Departure */}
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {format(dep, "HH:mm")}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {flight.depAirport.iataCode}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {flight.depAirport.city}
              </div>
            </div>

            {/* Duration line */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">
                {formatDuration(dep, arr)}
              </div>
              <div className="relative w-full flex items-center">
                <div className="flex-1 h-px bg-border/80" />
                <div className="mx-2 text-muted-foreground opacity-50">
                  <Plane className="h-3 w-3 rotate-90" />
                </div>
                <div className="flex-1 h-px bg-border/80" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Direct</div>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {format(arr, "HH:mm")}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {flight.arrAirport.iataCode}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {flight.arrAirport.city}
              </div>
            </div>
          </div>

          {/* Price + Book */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("font-medium text-xs", status.className)}
              >
                {status.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">${totalPrice.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {passengers > 1 ? `$${Number(flight.basePrice)}/person` : "per person"}
              </div>
            </div>
            <Button
              size="sm"
              className="rounded-xl font-medium gap-1"
              onClick={() =>
                router.push(
                  `/booking/${flight.flightId}?passengers=${passengers}${scheduleId ? `&scheduleId=${scheduleId}` : ""}`
                )
              }
              disabled={availableSeats < passengers || flight.status === "CANCELLED" || flight.status === "DEPARTED"}
              id={`book-flight-${flight.flightNumber}`}
            >
              Select <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              expanded ? "rotate-90" : ""
            )}
          />
          {expanded ? "Hide details" : "View details"}
        </button>
      </div>

      {/* Expanded details */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="border-t border-border/50 px-5 sm:px-6 py-4 bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Gate</div>
              <div className="font-medium">{flight.gate ?? "TBD"}</div>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Seats Available (E / B / F)</div>
              <div className="font-medium flex items-center gap-3">
                <span>{availableEconomy}</span>
                <span className="text-border/60">|</span>
                <span>{availableBusiness}</span>
                <span className="text-border/60">|</span>
                <span>{availableFirst}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Occupancy</div>
              <div className="font-medium">{occupancyPct}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Date</div>
              <div className="font-medium">{format(dep, "dd MMM yyyy")}</div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { icon: Wifi, label: "Wi-Fi" },
              { icon: Utensils, label: "Meals included" },
              { icon: Luggage, label: "23kg baggage" },
              { icon: TrendingDown, label: "Flexible fares" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
