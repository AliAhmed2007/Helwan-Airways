import Link from "next/link";
import { Plane, X, Globe, Mail, Rss } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Sustainability", href: "#" },
  ],
  Travel: [
    { label: "Flight Status", href: "#" },
    { label: "Check-in Online", href: "#" },
    { label: "Baggage Policy", href: "#" },
    { label: "Destinations", href: "/flights" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

const SOCIAL = [
  { Icon: X, label: "Twitter", href: "#" },
  { Icon: Globe, label: "Website", href: "#" },
  { Icon: Mail, label: "Email", href: "#" },
  { Icon: Rss, label: "Updates", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand column */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 transition-all duration-200 group-hover:scale-105">
                <Plane className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold tracking-tight text-foreground">
                Helwan<span className="text-muted-foreground font-light"> Airways</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              Connecting Egypt to the world with premium comfort and exceptional service.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted transition-all duration-200"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-[0.14em]">
                {category}
              </h3>
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

        <Separator className="my-10 opacity-40" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
