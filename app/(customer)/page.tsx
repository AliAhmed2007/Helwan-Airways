import { Suspense } from "react";
import { FlightSearchWidget } from "@/components/flights/FlightSearchWidget";
import { Plane, Shield, Clock, Star } from "lucide-react";

const DESTINATIONS = [
  { city: "Dubai", country: "UAE", iata: "DXB", price: "from $420", emoji: "🇦🇪", gradient: "from-amber-500/20 to-orange-500/20" },
  { city: "London", country: "United Kingdom", iata: "LHR", price: "from $680", emoji: "🇬🇧", gradient: "from-blue-500/20 to-indigo-500/20" },
  { city: "Istanbul", country: "Turkey", iata: "IST", price: "from $310", emoji: "🇹🇷", gradient: "from-red-500/20 to-rose-500/20" },
  { city: "Paris", country: "France", iata: "CDG", price: "from $590", emoji: "🇫🇷", gradient: "from-violet-500/20 to-purple-500/20" },
  { city: "New York", country: "USA", iata: "JFK", price: "from $950", emoji: "🇺🇸", gradient: "from-sky-500/20 to-blue-500/20" },
  { city: "Doha", country: "Qatar", iata: "DOH", price: "from $350", emoji: "🇶🇦", gradient: "from-emerald-500/20 to-teal-500/20" },
];

const STATS = [
  { value: "2M+", label: "Passengers Served", icon: <Star className="h-4 w-4" /> },
  { value: "150+", label: "Destinations", icon: <Plane className="h-4 w-4" /> },
  { value: "98%", label: "On-Time Rate", icon: <Clock className="h-4 w-4" /> },
  { value: "5★", label: "Safety Rating", icon: <Shield className="h-4 w-4" /> },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero copy */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                <Plane className="h-3.5 w-3.5" />
                <span>Egypt's Premium Carrier</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                  Fly Beyond
                  <br />
                  <span className="text-muted-foreground font-light">the Horizon</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Discover the world with Helwan Airways. Premium comfort, exceptional service,
                  and over 150 destinations across the globe.
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center gap-1.5 text-foreground font-bold text-xl">
                      {stat.icon}
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Search widget */}
            <div className="relative">
              {/* Card glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-border/80 via-border/20 to-transparent" />
              <div className="relative rounded-2xl bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl border border-border/50">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Search Flights</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Find the best deals to your destination
                  </p>
                </div>
                <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
                  <FlightSearchWidget />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Destinations ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Popular Routes
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Featured Destinations
            </h2>
          </div>
          <a
            href="/flights"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            View all destinations →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESTINATIONS.map((dest) => (
            <a
              key={dest.iata}
              href={`/flights?to=${dest.iata}&from=CAI&date=${new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]}&passengers=1&tripType=one-way`}
              className={`group relative rounded-2xl bg-gradient-to-br ${dest.gradient} border border-border/50 p-6 hover:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-4xl">{dest.emoji}</span>
                <span className="text-xs font-mono text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                  {dest.iata}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{dest.city}</h3>
                <p className="text-sm text-muted-foreground">{dest.country}</p>
                <p className="text-sm font-medium text-foreground mt-2 group-hover:underline">
                  {dest.price}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── Why Choose Us ─────────────────────────────────────── */}
      <section className="bg-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
              The Helwan Advantage
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Why Passengers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safety First",
                description: "5-star IATA safety rating. Our fleet undergoes rigorous daily maintenance checks.",
              },
              {
                icon: Clock,
                title: "98% On-Time",
                description: "Industry-leading punctuality. We respect your time as much as you do.",
              },
              {
                icon: Star,
                title: "Award-Winning Service",
                description: "Voted #1 African Carrier for passenger experience three years running.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-card border border-border/50 rounded-2xl p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
