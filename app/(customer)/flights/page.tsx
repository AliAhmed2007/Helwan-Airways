import { Suspense } from "react";
import { searchFlights, getAirports } from "@/lib/actions/flights";
import { FlightCard } from "@/components/flights/FlightCard";
import { FlightSearchWidget } from "@/components/flights/FlightSearchWidget";
import { Search, AlertCircle, Plane } from "lucide-react";

interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  passengers?: string;
  tripType?: string;
}

export const metadata = {
  title: "Search Flights",
  description: "Search and book available flights with Helwan Airways",
};

async function FlightResults({ searchParams }: { searchParams: SearchParams }) {
  const { from, to, date, passengers = "1" } = searchParams;

  if (!from || !to || !date) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Search for Flights</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Use the search form above to find available flights between your chosen destinations.
        </p>
      </div>
    );
  }

  const result = await searchFlights({
    fromIata: from,
    toIata: to,
    departureDate: date,
    passengers: parseInt(passengers),
    tripType: "one-way",
  });

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
        <p className="text-muted-foreground text-sm">{result.error}</p>
      </div>
    );
  }

  const flights = result.data;

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Plane className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No Flights Found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          No flights available from <strong>{from}</strong> to <strong>{to}</strong> on{" "}
          <strong>{date}</strong>. Try a different date or route.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{flights.length}</span>{" "}
          flight{flights.length !== 1 ? "s" : ""} found
        </p>
        <p className="text-xs text-muted-foreground">Sorted by departure time</p>
      </div>
      {flights.map((flight, index) => (
        <FlightCard
          key={flight.id}
          flight={{
            ...flight,
            basePrice: Number(flight.basePrice),
          }}
          passengers={parseInt(passengers)}
          index={index}
        />
      ))}
    </div>
  );
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Available Flights</h1>
        {params.from && params.to && (
          <p className="text-muted-foreground text-sm">
            {params.from} → {params.to}
            {params.date && (
              <> · {new Date(params.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar: Search widget */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h2 className="font-semibold text-sm mb-4">Modify Search</h2>
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
              <FlightSearchWidget />
            </Suspense>
          </div>
        </aside>

        {/* Results */}
        <div>
          <Suspense
            fallback={
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            }
          >
            <FlightResults searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
