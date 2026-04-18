import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ShieldX, Home, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Access Denied — Helwan Airways",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You don't have permission to access this area. The staff portal is only
            accessible to Helwan Airways operations team members.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl gap-2")}
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/flights"
            className={cn(buttonVariants({ variant: "default" }), "rounded-xl gap-2")}
          >
            <Plane className="h-4 w-4" />
            Browse Flights
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          If you believe this is a mistake, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}
