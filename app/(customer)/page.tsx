"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { FlightSearchWidget } from "@/components/flights/FlightSearchWidget";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Plane, Shield, Clock, Star, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
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
  { numericValue: 2,  prefix: "", suffix: "M+", label: "Passengers Served", icon: Star },
  { numericValue: 150, prefix: "", suffix: "+",  label: "Destinations",       icon: Plane },
  { numericValue: 98, prefix: "", suffix: "%",  label: "On-Time Rate",        icon: Clock },
  { numericValue: 5,  prefix: "", suffix: "★",  label: "Safety Rating",       icon: Shield },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Safety First",
    description: "5-star IATA safety rating. Our fleet undergoes rigorous daily maintenance checks with zero compromise.",
  },
  {
    icon: Clock,
    title: "98% On-Time",
    description: "Industry-leading punctuality. We respect your schedule as much as you do, every single flight.",
  },
  {
    icon: Star,
    title: "Award-Winning Service",
    description: "Voted #1 African Carrier for passenger experience three years running by the Global Travel Awards.",
  },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ stat, delay }: { stat: (typeof STATS)[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex items-center gap-1.5 text-2xl font-bold tracking-tight tabular-nums">
        <stat.icon className="h-4 w-4 text-primary opacity-70" />
        <AnimatedCounter
          end={stat.numericValue}
          prefix={stat.prefix}
          suffix={stat.suffix}
          duration={3}
        />
      </div>
      <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
        {stat.label}
      </p>
    </motion.div>
  );
}

// ─── Destination Card ─────────────────────────────────────────────────────────
function DestinationCard({ dest, index }: { dest: Destination; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.25, ease: "easeOut" } }}
    >
      <Link
        href={`/flights?to=${dest.iata}&from=CAI&passengers=1&tripType=one-way`}
        className={`group relative flex flex-col rounded-2xl bg-gradient-to-br ${dest.gradient} border border-border/40 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full overflow-hidden`}
      >
        {/* Subtle inner glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

        <div className="flex items-start justify-between mb-auto">
          <span className="text-3xl">{dest.emoji}</span>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-background/60 rounded-full px-2.5 py-1 tracking-widest">
            {dest.iata}
          </span>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-base text-foreground">{dest.city}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{dest.country}</p>
          <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-primary group-hover:gap-2 transition-all duration-200">
            <span>{dest.price}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const { icon: Icon, title, description } = feature;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative bg-card border border-border/50 rounded-2xl p-7 space-y-4 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-100 pointer-events-none" />

      {/* Radial fade to bg at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      {/* Atmospheric orbs */}
      <motion.div
        style={{ y: orbY }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          y: orbY,
          background: "radial-gradient(circle, oklch(0.44 0.19 264 / 12%) 0%, transparent 70%)",
        }}
      />
      <motion.div
        style={{ y: orbY }}
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          y: orbY,
          background: "radial-gradient(circle, oklch(0.55 0.18 310 / 10%) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* Left: Hero copy */}
          <motion.div style={{ y: copyY }} className="space-y-10">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Egypt&apos;s Premium Carrier</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="space-y-3"
            >
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08]">
                Fly Beyond
                <br />
                <span className="text-muted-foreground font-light">the Horizon</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed font-light">
                Discover the world with Helwan Airways. Premium comfort,
                exceptional service, and 150+ destinations across the globe.
              </p>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.30, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex flex-wrap gap-8 pt-2"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-xl tabular-nums">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <AnimatedCounter
                      end={stat.numericValue}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      duration={4}
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Search widget card */}
          <motion.div
            initial={{ opacity: 0, x: 28, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative"
          >
            {/* Card border gradient */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" />
            <div className="relative rounded-2xl bg-card/90 backdrop-blur-xl p-7 sm:p-8 shadow-2xl shadow-primary/10 border border-border/50">
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                    <Plane className="h-3 w-3 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">Search Flights</h2>
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Find the best deals to your destination
                </p>
              </div>
              <Suspense
                fallback={
                  <div className="space-y-3">
                    {[72, 72, 48].map((h, i) => (
                      <div
                        key={i}
                        className="rounded-xl shimmer"
                        style={{ height: h }}
                      />
                    ))}
                  </div>
                }
              >
                <FlightSearchWidget />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  useEffect(() => {
    getFeaturedDestinations().then((res) => {
      if (res.success) setDestinations(res.data);
      setLoadingDestinations(false);
    });
  }, []);

  return (
    <div className="flex flex-col">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Destinations ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
        <ScrollReveal className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.18em] mb-2">
              Popular Routes
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Featured Destinations</h2>
          </div>
          <Link
            href="/flights"
            className="group hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </ScrollReveal>

        {loadingDestinations ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((dest, i) => (
              <DestinationCard key={dest.iata} dest={dest} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section className="bg-muted/20 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal className="text-center mb-14">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.18em] mb-2">
              The Helwan Advantage
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Why Passengers Choose Us</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-card px-8 sm:px-16 py-16 text-center">
            {/* Background gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.44 0.19 264 / 12%), transparent)",
              }}
            />
            <div className="dot-grid absolute inset-0 pointer-events-none opacity-50" />

            <div className="relative">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.18em] mb-3">
                Ready to Fly?
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Book Your Next Adventure
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-10 text-sm leading-relaxed">
                Explore over 150 destinations with Egypt&apos;s most trusted carrier.
                Your journey starts here.
              </p>
              <Link
                href="/flights"
                className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
              >
                <Plane className="h-4 w-4 animate-plane-fly" />
                Explore Flights
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
