"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Plane, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DarkModeToggle } from "./DarkModeToggle";
import { FlightCommandSearch } from "./FlightCommandSearch";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/flights", label: "Flights" },
  { href: "/dashboard", label: "My Trips", requiresAuth: true },
];

// ─── Search trigger pill ────────────────────────────────────────────────────
function FlightSearchTrigger() {
  const [open, setOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut
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
      <button
        id="flight-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search flights (Ctrl+K)"
        className={cn(
          "group hidden sm:flex items-center gap-2.5 rounded-full",
          "border border-border/60 bg-muted/50 hover:bg-muted",
          "px-3 py-1.5 text-sm text-muted-foreground",
          "transition-all duration-200 hover:border-border hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Search flights</span>
        <kbd className="hidden lg:flex items-center gap-px rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground group-hover:border-border transition-colors">
          <span className="text-[9px]">⌃</span>K
        </kbd>
      </button>

      {/* Mobile: icon-only trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search flights"
        className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>

      <FlightCommandSearch open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "passenger";
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = NAV_LINKS.filter((l) => !l.requiresAuth || isSignedIn);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              <Plane className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">
              Helwan<span className="text-muted-foreground font-normal"> Airways</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm rounded-full transition-colors duration-200",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <FlightSearchTrigger />
            <DarkModeToggle />
            {isSignedIn ? (
              <div className="flex items-center gap-3 ml-2">
                <Badge variant={role === "staff" ? "default" : "secondary"} className={cn("hidden sm:inline-flex h-6 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2.5", role === "staff" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border-border/50")}>
                  {role === "staff" ? "Staff" : "Passenger"}
                </Badge>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="redirect">
                <Button size="sm" className="rounded-full cursor-pointer">
                  Sign In
                </Button>
              </SignInButton>
            )}
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
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
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-border/40 bg-background"
          >
            <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-2.5 text-sm rounded-xl transition-colors duration-150",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
