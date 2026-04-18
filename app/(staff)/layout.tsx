import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Plane, Users, BarChart2, Settings, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/flights", label: "Flights", icon: Plane },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "staff") redirect("/unauthorized");

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
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors duration-150",
                "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
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
