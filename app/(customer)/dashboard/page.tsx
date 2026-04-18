import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/lib/actions/bookings";
import { BoardingPass } from "@/components/customer/BoardingPass";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isPast, isFuture } from "date-fns";
import { Plane, Calendar, MapPin, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "My Trips",
  description: "View your upcoming and past flights with Helwan Airways",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  BOARDING: { label: "Boarding Now", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse" },
  DELAYED: { label: "Delayed", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  DEPARTED: { label: "Departed", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  ARRIVED: { label: "Arrived", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const result = await getUserBookings();
  const bookings = result.success ? result.data : [];

  const upcomingBookings = bookings.filter((b) =>
    isFuture(new Date(b.flight.departureTime)) && b.status !== "CANCELLED"
  );
  const pastBookings = bookings.filter((b) =>
    isPast(new Date(b.flight.departureTime)) || b.status === "CANCELLED"
  );

  const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Plane className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">No {label} Trips</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {label === "Upcoming"
          ? "Ready to explore? Search and book your next flight."
          : "Your completed flights will appear here."}
      </p>
      {label === "Upcoming" && (
        <a
          href="/flights"
          className="mt-4 text-sm text-primary hover:underline underline-offset-2"
        >
          Search flights →
        </a>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your bookings and access boarding passes
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="upcoming" className="rounded-lg">
            Upcoming <span className="ml-1.5 text-xs opacity-60">({upcomingBookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg">
            Past <span className="ml-1.5 text-xs opacity-60">({pastBookings.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length === 0 ? (
            <EmptyState label="Upcoming" />
          ) : (
            <div className="space-y-6">
              {upcomingBookings.map((booking) => {
                const flight = booking.flight;
                const dep = new Date(flight.departureTime);
                const status = STATUS_CONFIG[flight.status] ?? STATUS_CONFIG.SCHEDULED;

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-border/50 bg-card overflow-hidden"
                  >
                    {/* Flight info header */}
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Plane className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-mono font-bold">{flight.flightNumber}</div>
                            <div className="text-xs text-muted-foreground">Ref: {booking.bookingRef}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                          <div className="text-right">
                            <div className="font-semibold">${Number(booking.totalPrice).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Total paid</div>
                          </div>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-4 mb-5">
                        <div>
                          <div className="text-3xl font-bold">{format(dep, "HH:mm")}</div>
                          <div className="font-mono text-muted-foreground">{flight.departureAirport.iataCode}</div>
                          <div className="text-xs text-muted-foreground">{flight.departureAirport.city}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center text-muted-foreground">
                          <div className="w-full flex items-center gap-2">
                            <div className="flex-1 h-px bg-border" />
                            <Plane className="h-3.5 w-3.5 rotate-90" />
                            <div className="flex-1 h-px bg-border" />
                          </div>
                          <div className="text-xs mt-1">{format(dep, "dd MMM yyyy")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {format(new Date(flight.arrivalTime), "HH:mm")}
                          </div>
                          <div className="font-mono text-muted-foreground">{flight.arrivalAirport.iataCode}</div>
                          <div className="text-xs text-muted-foreground">{flight.arrivalAirport.city}</div>
                        </div>
                      </div>

                      {flight.gate && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Gate {flight.gate}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Boarding passes per passenger */}
                    <Separator className="opacity-40" />
                    <div className="p-6 space-y-4">
                      <h3 className="text-sm font-semibold">Boarding Passes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {booking.passengers.map((passenger) => (
                          <BoardingPass
                            key={passenger.id}
                            data={{
                              bookingRef: booking.bookingRef,
                              passengerName: `${passenger.firstName} ${passenger.lastName}`,
                              flightNumber: flight.flightNumber,
                              departureAirport: flight.departureAirport,
                              arrivalAirport: flight.arrivalAirport,
                              departureTime: flight.departureTime,
                              arrivalTime: flight.arrivalTime,
                              seatNumber: passenger.seat?.seatNumber ?? "—",
                              seatClass: passenger.seat?.class ?? "ECONOMY",
                              gate: flight.gate,
                              boardingGroup: passenger.boardingGroup,
                              checkInStatus: passenger.checkInStatus,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length === 0 ? (
            <EmptyState label="Past" />
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => {
                const flight = booking.flight;
                const dep = new Date(flight.departureTime);
                const status = STATUS_CONFIG[flight.status] ?? STATUS_CONFIG.ARRIVED;

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-border/50 bg-card/50 p-5 opacity-75"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                          <Plane className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-sm">{flight.flightNumber}</div>
                          <div className="text-xs text-muted-foreground">Ref: {booking.bookingRef}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground text-center hidden sm:block">
                        {flight.departureAirport.iataCode} → {flight.arrivalAirport.iataCode}
                        <div className="text-xs">{format(dep, "dd MMM yyyy")}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold text-sm">${Number(booking.totalPrice).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
