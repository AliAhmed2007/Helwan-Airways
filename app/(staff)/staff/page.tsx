import { format } from "date-fns";
import { Plane, ArrowRight } from "lucide-react";
import { getStaffDashboardStats } from "@/lib/actions/staff";
import { RevenueChart, OccupancyChart, CheckinStatusChart } from "@/components/staff/Charts";
import { KpiCard } from "@/components/staff/KpiCard";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Staff Dashboard — Helwan Airways",
};

const KPI_COLORS: Record<string, string> = {
  revenue:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  passengers: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ontime:     "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  delayed:    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

// Reusable styled link that looks like a ghost button — avoids the asChild issue
function GhostLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150",
        className
      )}
    >
      {children}
    </Link>
  );
}

export default async function StaffDashboardPage() {
  const result = await getStaffDashboardStats();
  const stats = result.success ? result.data : null;

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Failed to load dashboard statistics</h2>
        <p className="text-muted-foreground mt-2">
          Please ensure your database is connected and try again.
        </p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Today's Revenue",
      numericValue: stats.revenueToday,
      prefix: "$",
      suffix: "",
      sub: "From completed payments",
      icon: "revenue" as const,
      color: KPI_COLORS.revenue,
    },
    {
      label: "Passengers Today",
      numericValue: stats.passengersToday,
      prefix: "",
      suffix: "",
      sub: `${stats.totalToday} scheduled flights`,
      icon: "passengers" as const,
      color: KPI_COLORS.passengers,
    },
    {
      label: "On-Time Rate",
      numericValue: stats.onTimeRate,
      prefix: "",
      suffix: "%",
      sub: "Today's performance",
      icon: "ontime" as const,
      color: KPI_COLORS.ontime,
    },
    {
      label: "Delayed Flights",
      numericValue: stats.delayedToday,
      prefix: "",
      suffix: "",
      sub: "Requires immediate attention",
      icon: "delayed" as const,
      color: KPI_COLORS.delayed,
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {format(new Date(), "EEEE, dd MMMM yyyy")} · System Health:{" "}
            <span className="text-emerald-500 font-medium">Optimal</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/staff/flights"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-150"
          >
            Manage Flights
          </Link>
          <Link
            href="/staff/reservations"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors duration-150"
          >
            View Reservations
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} {...kpi} index={index} />
        ))}
      </div>

      {/* ── Charts Row: Revenue (wide) + Check-in Pie ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 rounded-2xl border-border/40 shadow-sm">
          <div className="mb-5">
            <h3 className="font-semibold text-sm">Revenue Trends</h3>
            <p className="text-xs text-muted-foreground">Daily earnings over the last 14 days</p>
          </div>
          <RevenueChart data={stats.dailyRevenueData} />
        </Card>

        <Card className="p-6 rounded-2xl border-border/40 shadow-sm">
          <div className="mb-5">
            <h3 className="font-semibold text-sm">Check-in Progress</h3>
            <p className="text-xs text-muted-foreground">
              Real-time status for today&apos;s departures
            </p>
          </div>
          <CheckinStatusChart data={stats.checkInStatusData} />
        </Card>
      </div>

      {/* ── Occupancy Chart Row (full-width) ────────────────────────────────── */}
      <Card className="p-6 rounded-2xl border-border/40 shadow-sm">
        <div className="mb-5">
          <h3 className="font-semibold text-sm">Capacity Analytics</h3>
          <p className="text-xs text-muted-foreground">
            Load factors for today&apos;s flights
          </p>
        </div>
        <OccupancyChart data={stats.occupancyData} />
      </Card>

      {/* ── Active Flights Table (full-width) ───────────────────────────────── */}
      <Card className="p-6 rounded-2xl border-border/40 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-sm">Active Flight Operations</h3>
            <p className="text-xs text-muted-foreground">
              {stats.totalToday} flights scheduled for today
            </p>
          </div>
          <GhostLink href="/staff/flights">
            View all <ArrowRight className="h-3 w-3" />
          </GhostLink>
        </div>

        {stats.recentFlights.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No flight operations for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stats.recentFlights.map((flight: {
              flightId: string;
              flightNumber: string;
              depIata: string;
              arrIata: string;
              time: Date;
              status: string;
            }) => (
              <Link
                key={flight.flightId}
                href={`/staff/flights/${flight.flightId}/manifest`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/20 bg-muted/30 hover:bg-muted/70 hover:border-border/50 transition-all duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors shrink-0">
                    <Plane className="h-3.5 w-3.5 text-primary/70" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold tracking-tight leading-none">
                      {flight.flightNumber}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">
                      {flight.depIata}{" "}
                      <ArrowRight className="inline h-2 w-2 mx-0.5" />{" "}
                      {flight.arrIata}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold tabular-nums">
                    {format(new Date(flight.time), "HH:mm")}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-block mt-1",
                      flight.status === "DELAYED"   && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      flight.status === "BOARDING"  && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                      flight.status === "ARRIVED"   && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      flight.status === "DEPARTED"  && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                      flight.status === "CANCELLED" && "bg-red-500/10 text-red-600 dark:text-red-400",
                      !["DELAYED","BOARDING","ARRIVED","DEPARTED","CANCELLED"].includes(flight.status) &&
                        "bg-background/80 text-muted-foreground"
                    )}
                  >
                    {flight.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
