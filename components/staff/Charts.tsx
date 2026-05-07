"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Revenue Area Chart
// ─────────────────────────────────────────────────────────────────────────────
export function RevenueChart({ data = [] }: { data?: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--color-foreground)",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
          itemStyle={{ color: "var(--color-foreground)" }}
          labelStyle={{ color: "var(--color-foreground)", fontWeight: "bold" }}
          formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-chart-1)"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "var(--color-chart-1)", strokeWidth: 2, stroke: "var(--color-background)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Occupancy Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
export function OccupancyChart({ data = [] }: { data?: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="flight"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--color-foreground)",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
          itemStyle={{ color: "var(--color-foreground)" }}
          labelStyle={{ color: "var(--color-foreground)", fontWeight: "bold" }}
          formatter={(value) => [`${Number(value ?? 0)}%`, "Occupancy"]}
        />
        <Bar dataKey="occupancy" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} opacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Check-in Status Pie Chart
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinStatusChart({ data = [] }: { data?: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--color-foreground)",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
          itemStyle={{ color: "var(--color-foreground)" }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-foreground)" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
