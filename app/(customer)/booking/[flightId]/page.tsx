import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getFlightById } from "@/lib/actions/flights";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { format } from "date-fns";
import { Plane, Clock, MapPin } from "lucide-react";

interface PageProps {
  params: Promise<{ flightId: string }>;
  searchParams: Promise<{ passengers?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { flightId } = await params;
  return {
    title: `Book Flight ${flightId}`,
  };
}

export default async function BookingPage({ params, searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { flightId } = await params;
  const { passengers = "1" } = await searchParams;
  const passengerCount = Math.min(Math.max(parseInt(passengers) || 1, 1), 9);

  const result = await getFlightById(flightId);
  if (!result.success) notFound();

  const flight = result.data;

  const dep = new Date(flight.departureTime);
  const arr = new Date(flight.arrivalTime);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Flight Summary Header */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-mono font-bold">{flight.flightNumber}</div>
              <div className="text-xs text-muted-foreground">{flight.aircraft}</div>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold">{format(dep, "HH:mm")}</div>
              <div className="text-sm font-mono text-muted-foreground">{flight.departureAirport.iataCode}</div>
              <div className="text-xs text-muted-foreground">{flight.departureAirport.city}</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-muted-foreground">{format(dep, "dd MMM yyyy")}</div>
              <div className="w-full h-px bg-border/60 my-1" />
              <div className="text-xs text-muted-foreground">Direct</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{format(arr, "HH:mm")}</div>
              <div className="text-sm font-mono text-muted-foreground">{flight.arrivalAirport.iataCode}</div>
              <div className="text-xs text-muted-foreground">{flight.arrivalAirport.city}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Base fare</div>
            <div className="text-2xl font-bold">${Number(flight.basePrice).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>
      </div>

      {/* Booking Wizard */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
        <BookingWizard
          flightId={flight.id}
          flightPrice={Number(flight.basePrice)}
          seats={flight.seats.map((s) => ({
            ...s,
            extraPrice: Number(s.extraPrice),
          }))}
          passengerCount={passengerCount}
        />
      </div>
    </div>
  );
}
