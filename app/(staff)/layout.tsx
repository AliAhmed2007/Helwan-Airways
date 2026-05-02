import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Plane,
  Users,
  Armchair,
  CalendarCheck,
  Building2,
  MapPin,
  CreditCard,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { StaffNavLink } from "@/components/staff/StaffNavLink";

const NAV_ITEMS = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/staff/flights", label: "Flights", icon: Plane },
  { href: "/staff/passengers", label: "Passengers", icon: Users },
  { href: "/staff/seats-baggage", label: "Seats & Baggage", icon: Armchair },
  { href: "/staff/reservations", label: "Reservations", icon: CalendarCheck },
  { href: "/staff/aircrafts", label: "Aircrafts", icon: Building2 },
  { href: "/staff/airports", label: "Airports", icon: MapPin },
  { href: "/staff/payments", label: "Payments", icon: CreditCard },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims, userId } = await auth();
  let role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!role && userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata?.role as string | undefined;
  }

  console.log(role);
  if (role !== "staff") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/50 bg-card flex flex-col">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Plane className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Helwan Airways</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Operations</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <StaffNavLink key={href} href={href} label={label} icon={<Icon className="h-4 w-4" />} exact={exact} />
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
            <div>
              <div className="text-xs font-medium">Staff Portal</div>
              <div className="text-[10px] text-muted-foreground">Operations Team</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
