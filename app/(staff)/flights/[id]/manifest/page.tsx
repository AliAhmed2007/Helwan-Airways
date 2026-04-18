import { notFound } from "next/navigation";
import { getFlightById } from "@/lib/actions/flights";
import { getFlightManifest } from "@/lib/actions/bookings";
import { ManifestTable } from "@/components/staff/ManifestTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plane, ChevronLeft, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  BOARDING: { label: "Boarding", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  DELAYED: { label: "Delayed", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  DEPARTED: { label: "Departed", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  ARRIVED: { label: "Arrived", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Passenger Manifest — Flight ${id}` };
}

export default async function ManifestPage({ params }: PageProps) {
  const { id } = await params;

  const [flightResult, manifestResult] = await Promise.all([
    getFlightById(id),
    getFlightManifest(id),
  ]);

  if (!flightResult.success) notFound();

  const flight = flightResult.data;
  const passengers = manifestResult.success ? manifestResult.data : [];

  const dep = new Date(flight.departureTime);
  const arr = new Date(flight.arrivalTime);
  const status = STATUS_CONFIG[flight.status] ?? STATUS_CONFIG.SCHEDULED;
  const checkedInCount = passengers.filter((p) => p.checkInStatus === "CHECKED_IN").length;

  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/staff/flights"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Flights
      </Link>

      {/* Flight header */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold font-mono">{flight.flightNumber}</h1>
                <Badge variant="outline" className={cn("text-xs", status.className)}>
                  {status.label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{flight.aircraft}</div>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{format(dep, "HH:mm")}</div>
              <div className="font-mono text-muted-foreground text-sm">{flight.departureAirport.iataCode}</div>
              <div className="text-xs text-muted-foreground">{flight.departureAirport.city}</div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-px w-8 bg-border" />
              <Plane className="h-3.5 w-3.5 rotate-90" />
              <div className="h-px w-8 bg-border" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{format(arr, "HH:mm")}</div>
              <div className="font-mono text-muted-foreground text-sm">{flight.arrivalAirport.iataCode}</div>
              <div className="text-xs text-muted-foreground">{flight.arrivalAirport.city}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold">{passengers.length}</div>
              <div className="text-xs text-muted-foreground">Total booked</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {checkedInCount}
              </div>
              <div className="text-xs text-muted-foreground">Checked in</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {passengers.length - checkedInCount}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>

        {flight.gate && (
          <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-medium text-foreground">Gate {flight.gate}</span>
            <span>·</span>
            <span>Terminal 1</span>
            <span>·</span>
            <span>{format(dep, "dd MMMM yyyy")}</span>
          </div>
        )}
      </div>

      {/* Manifest header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Passenger Manifest</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Check in passengers and update baggage weights
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">{passengers.length} passengers</span>
        </div>
      </div>

      {/* Manifest table */}
      <ManifestTable
        passengers={passengers.map((p) => ({
          ...p,
          baggageWeight: p.baggageWeight ? Number(p.baggageWeight) : null,
          checkInStatus: p.checkInStatus as "NOT_CHECKED_IN" | "CHECKED_IN",
          seat: p.seat ? {
            ...p.seat,
            class: p.seat.class as string,
          } : null,
        }))}
      />
    </div>
  );
}
