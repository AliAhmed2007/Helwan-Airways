"use client";

import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { DollarSign, Users, TrendingUp, AlertTriangle, Plane, Map, Package, CreditCard, CheckCircle, XCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";

// Map strings to Icon components
const ICON_MAP = {
  revenue: DollarSign,
  passengers: Users,
  ontime: TrendingUp,
  delayed: AlertTriangle,
  plane: Plane,
  map: Map,
  package: Package,
  creditCard: CreditCard,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  calendar: Calendar,
};

interface KpiCardProps {
  label: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  sub: string;
  // Change type to accept keys of ICON_MAP
  icon: keyof typeof ICON_MAP;
  color: string;
  index: number;
  decimals?: number;
}

export function KpiCard({
  label,
  numericValue,
  prefix = "",
  suffix = "",
  sub,
  icon,
  color,
  index,
  decimals = 0,
}: KpiCardProps) {
  // Resolve the component based on the string key
  const Icon = ICON_MAP[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <Card className="p-5 rounded-2xl border-border/50 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            {Icon && <Icon className="h-4 w-4" />}
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums">
          <AnimatedCounter
            end={numericValue}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            duration={1.8}
            separator=","
          />
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
        <div className="text-xs text-muted-foreground mt-1 opacity-70">{sub}</div>
      </Card>
    </motion.div>
  );
}