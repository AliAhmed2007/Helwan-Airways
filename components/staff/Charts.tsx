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
  RadialBarChart,
  RadialBar,
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

// ─────────────────────────────────────────────────────────────────────────────
// Class Breakdown Radial Bar Chart
// Shows First / Business / Economy booking distribution
// ─────────────────────────────────────────────────────────────────────────────
export function ClassBreakdownChart({ data = [] }: { data?: { class: string; bookings: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.bookings, 0);

  // RadialBarChart needs a numeric `fill` key; we use CSS vars mapped to chart colors
  const COLORS: Record<string, string> = {
    First:    "oklch(0.72 0.16 80)",   // amber
    Business: "oklch(0.62 0.22 310)",  // violet
    Economy:  "oklch(0.55 0.22 264)",  // indigo
  };

  const chartData = data.map((d) => ({
    name:     d.class,
    bookings: d.bookings,
    fill:     COLORS[d.class] ?? "var(--color-chart-1)",
    // percentage for label
    pct: total > 0 ? Math.round((d.bookings / total) * 100) : 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="30%"
          outerRadius="90%"
          barSize={18}
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            dataKey="bookings"
            cornerRadius={8}
            background={{ fill: "var(--color-muted)", fillOpacity: 0.3 }}
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
            formatter={(value, name) => [`${value} bookings`, name]}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Legend with percentages */}
      <div className="flex justify-center gap-5">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: d.fill }}
            />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-semibold tabular-nums">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
