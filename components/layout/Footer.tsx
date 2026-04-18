import Link from "next/link";
import { Plane, Share2, Globe, Mail, Rss } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  "Company": [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Sustainability", href: "#" },
  ],
  "Travel": [
    { label: "Flight Status", href: "#" },
    { label: "Check-in Online", href: "#" },
    { label: "Baggage Policy", href: "#" },
    { label: "Destinations", href: "/flights" },
  ],
  "Support": [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plane className="h-4 w-4" />
              </div>
              <span className="font-semibold tracking-tight">
                Helwan<span className="text-muted-foreground font-normal"> Airways</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Connecting Egypt to the world. Premium comfort, exceptional service, 150+ destinations.
            </p>
            <div className="flex items-center gap-3">
              {[Share2, Globe, Mail, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Helwan Airways. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            IATA Member · ICAO Certified · Trusted by 2M+ passengers
          </p>
        </div>
      </div>
    </footer>
  );
}
