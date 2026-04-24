import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAllFlights } from "@/lib/actions/flights";
import { RevenueChart, OccupancyChart, CheckinStatusChart } from "@/components/staff/Charts";
import { KpiCard } from "@/components/staff/KpiCard";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, Plane, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Staff Dashboard — Helwan Airways",
};

const KPI_COLORS: Record<string, string> = {
  revenue: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  passengers: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ontime: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  delayed: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default async function StaffDashboardPage() {
  const result = await getAllFlights();
  const flights = result.success ? result.data : [];

  const todayFlights = flights.filter(
    (f) => new Date(f.schedDeparture).toDateString() === new Date().toDateString()
  );
  const delayedFlights = flights.filter((f) => f.status === "DELAYED").length;
  const totalPassengersToday = todayFlights.reduce(
    (acc, f) => acc + f._count.reservations,
    0
  );
  const onTimeFlights = todayFlights.filter(
    (f) => f.status !== "DELAYED" && f.status !== "CANCELLED"
  ).length;
  const onTimeRate = todayFlights.length
    ? Math.round((onTimeFlights / todayFlights.length) * 100)
    : 100;

  const kpis = [
    {
      label: "Today's Revenue",
      numericValue: 42810,
      prefix: "$",
      suffix: "",
      sub: "+12% from yesterday",
      icon: DollarSign,
      color: KPI_COLORS.revenue,
    },
    {
      label: "Passengers Today",
      numericValue: totalPassengersToday,
      prefix: "",
      suffix: "",
      sub: `${todayFlights.length} flights`,
      icon: Users,
      color: KPI_COLORS.passengers,
    },
    {
      label: "On-Time Rate",
      numericValue: onTimeRate,
      prefix: "",
      suffix: "%",
      sub: "Last 24 hours",
      icon: TrendingUp,
      color: KPI_COLORS.ontime,
    },
    {
      label: "Delayed Flights",
      numericValue: delayedFlights,
      prefix: "",
      suffix: "",
      sub: "Requires attention",
      icon: AlertTriangle,
      color: KPI_COLORS.delayed,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "EEEE, dd MMMM yyyy")} · Real-time overview
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, numericValue, prefix, suffix, sub, icon, color }, index) => (
          <KpiCard
            key={label}
            label={label}
            numericValue={numericValue}
            prefix={prefix}
            suffix={suffix}
            sub={sub}
            icon={icon}
            color={color}
            index={index}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 rounded-2xl border-border/50">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Daily Revenue</h3>
            <p className="text-xs text-muted-foreground">Last 14 days</p>
          </div>
          <RevenueChart />
        </Card>

        <Card className="p-5 rounded-2xl border-border/50">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Flight Occupancy</h3>
            <p className="text-xs text-muted-foreground">Today's flights</p>
          </div>
          <OccupancyChart />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 rounded-2xl border-border/50">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Check-in Status</h3>
            <p className="text-xs text-muted-foreground">All passengers today</p>
          </div>
          <CheckinStatusChart />
        </Card>

        {/* Today's flights quick list */}
        <Card className="p-5 rounded-2xl border-border/50">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Today's Flights</h3>
            <p className="text-xs text-muted-foreground">{todayFlights.length} scheduled</p>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-[220px]">
            {todayFlights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No flights today</p>
            ) : (
              todayFlights.map((flight) => (
                <a
                  key={flight.flightId}
                  href={`/staff/flights/${flight.flightId}/manifest`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-sm font-semibold">{flight.flightNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {flight.depAirport.iataCode}→{flight.arrAirport.iataCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(flight.schedDeparture), "HH:mm")}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        flight.status === "DELAYED"
                          ? "bg-amber-500/10 text-amber-600"
                          : flight.status === "BOARDING"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {flight.status}
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
