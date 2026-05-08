"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Plane, Menu, X, Search, LayoutDashboard, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DarkModeToggle } from "./DarkModeToggle";
import { FlightCommandSearch } from "./FlightCommandSearch";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/flights", label: "Flights" },
  { href: "/dashboard", label: "My Trips", requiresAuth: true },
];

// ─── Search trigger ───────────────────────────────────────────────────────────
function FlightSearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Desktop pill */}
      <button
        id="flight-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search flights (Ctrl+K)"
        className={cn(
          "group hidden sm:flex items-center gap-2.5 rounded-full",
          "border border-border/50 bg-muted/60 hover:bg-muted",
          "px-3.5 py-1.5 text-sm text-muted-foreground",
          "transition-all duration-200 hover:border-border hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden lg:inline">Search flights</span>
        <kbd className="hidden lg:flex items-center gap-0.5 rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <span className="text-[9px]">⌃</span>K
        </kbd>
      </button>

      {/* Mobile icon */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search flights"
        className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>

      <FlightCommandSearch open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "passenger";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = NAV_LINKS.filter((l) => !l.requiresAuth || isSignedIn);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm shadow-primary/5"
          : "border-b border-transparent bg-background/50 backdrop-blur-md"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 transition-all duration-200 group-hover:scale-110 group-hover:shadow-primary/50">
              <Plane className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">
              Helwan<span className="text-muted-foreground font-light"> Airways</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm rounded-full transition-all duration-200",
                  pathname === link.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-muted"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <FlightSearchTrigger />
            <DarkModeToggle />

            {isSignedIn ? (
              <div className="flex items-center gap-2.5 ml-1">
                <Badge
                  variant={role === "staff" ? "default" : "secondary"}
                  className={cn(
                    "hidden sm:inline-flex h-5 text-[10px] uppercase tracking-widest font-semibold rounded-full px-2.5",
                    role === "staff"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border/50"
                  )}
                >
                  {role === "staff" ? "Staff" : "Passenger"}
                </Badge>
                <UserButton
                  appearance={{
                    elements: { avatarBox: "h-8 w-8 ring-2 ring-primary/20" },
                  }}
                >
                  <UserButton.MenuItems>
                    {role === "staff" ? (
                      <UserButton.Link
                        label="Dashboard"
                        labelIcon={<LayoutDashboard size={15} />}
                        href="/staff"
                      />
                    ) : (
                      <UserButton.Link
                        label="Manage Flights"
                        labelIcon={<CalendarDays size={15} />}
                        href="/dashboard"
                      />
                    )}
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            ) : (
              <SignInButton mode="redirect">
                <Button size="sm" className="ml-1 rounded-full shadow-sm shadow-primary/20 font-medium cursor-pointer">
                  Sign In
                </Button>
              </SignInButton>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-0.5">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-4 py-2.5 text-sm rounded-xl transition-colors duration-150",
                      pathname === link.href
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
