import { Suspense } from "react";
import { getAllPublicFlights } from "@/lib/actions/flights";
import { FlightSearchWidget } from "@/components/flights/FlightSearchWidget";
import { FlightsClient } from "@/components/flights/FlightsClient";
import { Plane } from "lucide-react";

export const metadata = {
  title: "Search Flights — Helwan Airways",
  description: "Search and book available flights with Helwan Airways",
};

// Force dynamic so searchParams reflect navigation without caching issues
export const dynamic = "force-dynamic";

async function FlightResultsSection() {
  const result = await getAllPublicFlights();

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Plane className="h-7 w-7 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Failed to load flights</h3>
        <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  // Serialize Decimal → number and Date → string for the client
  const schedules = result.data.map((s) => ({
    ...s,
    departureDate: s.departureDate instanceof Date ? s.departureDate.toISOString() : s.departureDate,
    flight: {
      ...s.flight,
      basePrice: Number(s.flight.basePrice),
      schedDeparture:
        s.flight.schedDeparture instanceof Date
          ? s.flight.schedDeparture.toISOString()
          : s.flight.schedDeparture,
      schedArrival:
        s.flight.schedArrival instanceof Date
          ? s.flight.schedArrival.toISOString()
          : s.flight.schedArrival,
      aircraft: {
        ...s.flight.aircraft,
        seats: s.flight.aircraft.seats.map((seat) => ({
          ...seat,
          extraPrice: Number(seat.extraPrice),
        })),
      },
    },
  }));

  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      }
    >
      <FlightsClient schedules={schedules} />
    </Suspense>
  );
}

export default function FlightsPage() {
  return (
    <div className="flex flex-col">
      {/* ─── Header Banner ─────────────────────────────────────── */}
      <section className="relative border-b border-border/40 bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-8">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
              Helwan Airways
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Available Flights
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              Browse all upcoming flights or use the search below to find specific routes. Filters update results instantly.
            </p>
          </div>

          {/* Search widget */}
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
            <h2 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
              Search &amp; Filter
            </h2>
            <Suspense fallback={<div className="h-[200px] animate-pulse bg-muted rounded-xl" />}>
              <FlightSearchWidget orientation="horizontal" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ─── Results ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
              <div className="h-[500px] rounded-2xl bg-muted animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <FlightResultsSection />
        </Suspense>
      </section>
    </div>
  );
}