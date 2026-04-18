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
const generateRevenueData = () => {
  const data = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.floor(Math.random() * 40000 + 15000),
    });
  }
  return data;
};

const REVENUE_DATA = generateRevenueData();

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Occupancy Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
const OCCUPANCY_DATA = [
  { flight: "HA101", occupancy: 87 },
  { flight: "HA102", occupancy: 62 },
  { flight: "HA103", occupancy: 94 },
  { flight: "HA104", occupancy: 45 },
  { flight: "HA105", occupancy: 78 },
  { flight: "HA106", occupancy: 55 },
  { flight: "HA107", occupancy: 90 },
  { flight: "HA108", occupancy: 70 },
];

export function OccupancyChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={OCCUPANCY_DATA} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
        <XAxis
          dataKey="flight"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value) => [`${Number(value ?? 0)}%`, "Occupancy"]}
        />
        <Bar dataKey="occupancy" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Check-in Status Pie Chart
// ─────────────────────────────────────────────────────────────────────────────
const CHECKIN_DATA = [
  { name: "Checked In", value: 312, color: "#22c55e" },
  { name: "Not Checked In", value: 148, color: "hsl(var(--muted-foreground))" },
];

export function CheckinStatusChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={CHECKIN_DATA}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {CHECKIN_DATA.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
