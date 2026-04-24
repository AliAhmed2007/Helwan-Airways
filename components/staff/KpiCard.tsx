"use client";

import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  label: string;
  /** Raw numeric value to animate to */
  numericValue: number;
  /** Text shown before the number, e.g. "$" */
  prefix?: string;
  /** Text shown after the number, e.g. "%" or "+" */
  suffix?: string;
  sub: string;
  icon: LucideIcon;
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
  icon: Icon,
  color,
  index,
  decimals = 0,
}: KpiCardProps) {
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
            <Icon className="h-4 w-4" />
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
