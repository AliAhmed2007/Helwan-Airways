"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type PassengerRow = {
  passengerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  nationality: string | null;
  createdAt: Date;
  _count: { reservations: number };
};

export const columns: ColumnDef<PassengerRow>[] = [
  {
    id: "fullName",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-sm">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Contact Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-xs gap-2">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span>{row.original.email}</span>
        </div>
        {row.original.phone && (
          <div className="flex items-center text-xs gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.phone}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "nationality",
    header: "Nationality",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.nationality || <span className="text-muted-foreground">N/A</span>}
      </span>
    ),
  },
  {
    id: "bookings",
    accessorFn: (row) => row._count.reservations,
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Bookings <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono">
        {row.original._count.reservations}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{format(new Date(row.original.createdAt), "MMM d, yyyy")}</span>
      </div>
    ),
  },
];
