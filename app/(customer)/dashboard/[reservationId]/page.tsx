import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getBookingById } from "@/lib/actions/bookings";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BoardingPass } from "@/components/customer/BoardingPass";
import { CancelBookingButton } from "@/components/customer/CancelBookingButton";
import { format, differenceInHours } from "date-fns";
import {
  Plane,
  MapPin,
  Luggage,
  CreditCard,
  User,
  ArrowLeft,
  Clock,
  Armchair,
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = await params;
  return {
    title: `Booking ${reservationId.slice(0, 8).toUpperCase()} — Helwan Airways`,
  };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SCHEDULED:  { label: "Scheduled",    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  BOARDING:   { label: "Boarding Now", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse" },
  DELAYED:    { label: "Delayed",      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  DEPARTED:   { label: "Departed",     className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  ARRIVED:    { label: "Arrived",      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED:  { label: "Cancelled",    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  CONFIRMED:  { label: "Confirmed",    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
};

const CLASS_LABELS: Record<string, string> = {
  FIRST: "First Class",
  BUSINESS: "Business",
  ECONOMY: "Economy",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-6 divide-y divide-border/30">{children}</div>
    </div>
  );
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { reservationId } = await params;
  const result = await getBookingById(reservationId);
  if (!result.success) notFound();

  const res = result.data;
  const flight = res.flight;
  const dep = new Date(flight.schedDeparture);
  const arr = new Date(flight.schedArrival);
  const flightStatus = STATUS_CONFIG[flight.status] ?? STATUS_CONFIG.SCHEDULED;
  const resStatus = STATUS_CONFIG[res.status] ?? STATUS_CONFIG.CONFIRMED;
  const hoursUntilDep = differenceInHours(dep, new Date());
  const canCancel = res.status !== "CANCELLED" && hoursUntilDep >= 48;

  const durationMins = Math.round((arr.getTime() - dep.getTime()) / 60000);
  const durationStr = `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        My Trips
      </Link>

      {/* ── Hero header ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        {/* Coloured top strip */}
        <div className="bg-primary px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-primary-foreground font-mono text-lg">
                {flight.flightNumber}
              </div>
              <div className="text-primary-foreground/70 text-xs">
                {flight.aircraft.manufacturer} {flight.aircraft.model}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary-foreground/15 text-primary-foreground border-0 text-xs"
            >
              {resStatus.label}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-primary-foreground/15 text-primary-foreground border-0 text-xs font-mono tracking-widest"
            >
              {res.bookingRef}
            </Badge>
          </div>
        </div>

        {/* Route bar */}
        <div className="px-6 py-6 flex items-center gap-4">
          <div>
            <div className="text-4xl font-bold tracking-tight">{format(dep, "HH:mm")}</div>
            <div className="font-mono text-muted-foreground text-sm">{flight.depAirport.iataCode}</div>
            <div className="text-xs text-muted-foreground">{flight.depAirport.city}</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-muted-foreground">
            <div className="text-xs mb-1">{durationStr}</div>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <Plane className="h-3.5 w-3.5 rotate-90" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="text-xs mt-1">{format(dep, "EEE, dd MMM yyyy")}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold tracking-tight">{format(arr, "HH:mm")}</div>
            <div className="font-mono text-muted-foreground text-sm">{flight.arrAirport.iataCode}</div>
            <div className="text-xs text-muted-foreground">{flight.arrAirport.city}</div>
          </div>
        </div>

        {/* Status row */}
        <div className="px-6 pb-5 flex flex-wrap items-center gap-3">
          <Badge variant="outline" className={flightStatus.className}>
            Flight: {flightStatus.label}
          </Badge>
          {res.schedule?.gate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Gate {res.schedule.gate}
            </span>
          )}
          {res.boardingGroup && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Boarding Group {res.boardingGroup}
            </span>
          )}
        </div>
      </div>

      {/* ── Three-column grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Passenger */}
        <Section title="Passenger" icon={User}>
          <InfoRow label="Full Name" value={`${res.passenger.firstName} ${res.passenger.lastName}`} />
          <InfoRow label="Passport" value={<span className="font-mono">{res.passenger.passportNum}</span>} />
          <InfoRow label="Nationality" value={res.passenger.nationality} />
          <InfoRow label="Email" value={res.passenger.email} />
          {res.passenger.phone && <InfoRow label="Phone" value={res.passenger.phone} />}
        </Section>

        {/* Seat */}
        <Section title="Seat & Class" icon={Armchair}>
          <InfoRow label="Seat Number" value={<span className="font-mono font-bold">{res.seat?.seatNumber ?? "—"}</span>} />
          <InfoRow label="Travel Class" value={CLASS_LABELS[res.travelClass] ?? res.travelClass} />
          <InfoRow label="Boarding Group" value={res.boardingGroup ?? "—"} />
          <InfoRow
            label="Check-In Status"
            value={
              <Badge
                variant="outline"
                className={
                  res.checkInStatus === "CHECKED_IN"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }
              >
                {res.checkInStatus === "CHECKED_IN" ? "Checked In" : "Pending"}
              </Badge>
            }
          />
        </Section>

        {/* Baggage */}
        <Section title="Baggage" icon={Luggage}>
          {res.baggage.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No checked baggage</p>
          ) : (
            res.baggage.map((bag, i) => (
              <InfoRow
                key={bag.baggageId}
                label={`Bag ${i + 1}`}
                value={
                  <span className="capitalize">
                    {bag.baggageType?.toLowerCase().replace("_", " ")} ·{" "}
                    <Badge variant="outline" className="text-[10px] ml-1">
                      {bag.status}
                    </Badge>
                  </span>
                }
              />
            ))
          )}
        </Section>

        {/* Payment */}
        <Section title="Payment" icon={CreditCard}>
          {res.payments.map((p) => (
            <InfoRow
              key={p.paymentId}
              label={p.paymentMethod.replace("_", " ")}
              value={
                <span className="flex items-center gap-2">
                  ${Number(p.amount).toLocaleString()}
                  <Badge variant="outline" className="text-[10px]">
                    {p.status}
                  </Badge>
                </span>
              }
            />
          ))}
          <InfoRow
            label="Total"
            value={<span className="font-bold">${Number(res.totalAmount).toLocaleString()}</span>}
          />
        </Section>
      </div>

      {/* ── Boarding Pass ─────────────────────────────────────────── */}
      {res.status !== "CANCELLED" && (
        <div>
          <h2 className="text-sm font-semibold mb-3">Boarding Pass</h2>
          <BoardingPass
            data={{
              bookingRef: res.bookingRef,
              passengerName: `${res.passenger.firstName} ${res.passenger.lastName}`,
              flightNumber: flight.flightNumber,
              departureAirport: flight.depAirport,
              arrivalAirport: flight.arrAirport,
              departureTime: flight.schedDeparture,
              arrivalTime: flight.schedArrival,
              seatNumber: res.seat?.seatNumber ?? "—",
              seatClass: res.travelClass ?? "ECONOMY",
              gate: res.schedule?.gate ?? null,
              boardingGroup: res.boardingGroup ?? null,
              checkInStatus: res.checkInStatus,
            }}
          />
        </div>
      )}

      {/* ── Cancel section ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-3">
        <h2 className="text-sm font-semibold">Booking Actions</h2>
        <Separator className="opacity-40" />
        {res.status === "CANCELLED" ? (
          <p className="text-sm text-muted-foreground">This booking has been cancelled.</p>
        ) : !canCancel ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Cancellation is no longer available — the departure is less than 48 hours away.
            </p>
            <p className="text-xs text-muted-foreground">
              Please contact Helwan Airways support if you need assistance.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm">Cancel this booking</p>
              <p className="text-xs text-muted-foreground">
                You will receive a full refund. Cancellations allowed up to 48 h before departure.
              </p>
            </div>
            <CancelBookingButton reservationId={res.reservationId} />
          </div>
        )}
      </div>
    </div>
  );
}
