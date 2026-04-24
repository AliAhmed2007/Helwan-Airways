"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { FlightSearchWidget } from "@/components/flights/FlightSearchWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Plane, Shield, Clock, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getFeaturedDestinations } from "@/lib/actions/flights";

type Destination = {
  city: string;
  country: string;
  iata: string;
  price: string;
  emoji: string;
  gradient: string;
  accent: string;
};

const STATS = [
  { numericValue: 2, prefix: "", suffix: "M+", label: "Passengers Served", icon: Star },
  { numericValue: 150, prefix: "", suffix: "+", label: "Destinations", icon: Plane },
  { numericValue: 98, prefix: "", suffix: "%", label: "On-Time Rate", icon: Clock },
  { numericValue: 5, prefix: "", suffix: "★", label: "Safety Rating", icon: Shield },
];

const FEATURES = [
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
];

// ─── Animated counter ────────────────────────────────────────────────────────
function StatCard({ stat, delay }: { stat: typeof STATS[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="text-center space-y-1"
    >
      <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground tabular-nums">
        <stat.icon className="h-5 w-5 text-primary opacity-80" />
        <AnimatedCounter
          end={stat.numericValue}
          prefix={stat.prefix}
          suffix={stat.suffix}
          duration={3}
        />
      </div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
    </motion.div>
  );
}

// ─── Destination Card ────────────────────────────────────────────────────────
function DestinationCard({
  dest,
  index,
}: {
  dest: Destination;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className="block"
    >
      <Link
        href={`/flights?to=${dest.iata}&from=CAI&passengers=1&tripType=one-way`}
        className={`group relative rounded-2xl bg-gradient-to-br ${dest.gradient} border border-border/50 p-6 hover:border-border transition-colors duration-300 hover:shadow-lg block h-full`}
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
      </Link>
    </motion.div>
  );
}

// ─── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const { icon: Icon, title, description } = feature;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="bg-card border border-border/50 rounded-2xl p-6 space-y-3"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Hero Section (with parallax) ───────────────────────────────────────────
function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section ref={containerRef} className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Parallax orbs */}
      <motion.div
        style={{ y: orbY }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: orbY }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hero copy */}
          <motion.div style={{ y: copyY }} className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
            >
              <Plane className="h-3.5 w-3.5" />
              <span>Egypt&apos;s Premium Carrier</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                Fly Beyond
                <br />
                <span className="text-muted-foreground font-light">the Horizon</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Discover the world with Helwan Airways. Premium comfort, exceptional service, and
                over 150 destinations across the globe.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex flex-wrap gap-6"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-xl tabular-nums">
                    <stat.icon className="h-4 w-4" />
                    <AnimatedCounter
                      end={stat.numericValue}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      duration={4}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Search widget */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative"
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  useEffect(() => {
    getFeaturedDestinations().then(res => {
      if (res.success) {
        setDestinations(res.data);
      }
      setLoadingDestinations(false);
    });
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
        <ScrollReveal className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Popular Routes
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Featured Destinations</h2>
          </div>
          <Link
            href="/flights"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            View all →
          </Link>
        </ScrollReveal>

        {loadingDestinations ? (
           <div className="flex justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((dest, i) => (
              <DestinationCard key={dest.iata} dest={dest} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <ScrollReveal className="text-center mb-12">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
              The Helwan Advantage
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Why Passengers Choose Us</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
        <ScrollReveal>
          <div className="relative rounded-3xl bg-card border border-border/50 overflow-hidden px-8 sm:px-16 py-16 text-center shadow-sm">
            {/* Background orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Ready to Fly?
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Book Your Next Adventure
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm leading-relaxed">
                Explore over 150 destinations with Egypt&apos;s most trusted carrier. Your journey
                starts here.
              </p>
              <Link
                href="/flights"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md"
              >
                <Plane className="h-4 w-4" />
                Explore Flights
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
