"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StaffNavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function StaffNavLink({ href, label, icon, exact }: StaffNavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <div className="flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="flex-1">{label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}
