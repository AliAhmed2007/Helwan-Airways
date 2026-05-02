"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Mail, Phone, Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deletePassenger } from "@/lib/actions/staff";
import { useRouter } from "next/navigation";

export type PassengerRow = {
  passengerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  nationality: string | null;
  dateOfBirth: Date | null;
  passportNum: string | null;
  createdAt: Date;
  _count: { reservations: number };
  reservations: { createdAt: Date; status: string; totalAmount: string | number; travelClass: string }[];
};

function PassengerActionsCell({ row }: { row: { original: PassengerRow } }) {
  const router = useRouter();
  
  async function handleDelete() {
    if (!confirm(`Delete passenger ${row.original.firstName} ${row.original.lastName}?`)) return;
    const res = await deletePassenger(row.original.passengerId);
    if (res.success) {
      toast.success("Passenger deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete passenger");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 text-sm"
          onClick={handleDelete}
        >
          Delete Passenger
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<PassengerRow>[] = [
  {
    id: "fullName",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <span className="font-medium text-sm">{row.original.firstName} {row.original.lastName}</span>
        {row.original.gender && (
          <div className="text-xs text-muted-foreground">{row.original.gender}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Contact",
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
    accessorKey: "passportNum",
    header: "Passport",
    cell: ({ row }) => (
      <span className="text-sm font-mono">
        {row.original.passportNum || <span className="text-muted-foreground">—</span>}
      </span>
    ),
  },
  {
    id: "bookings",
    accessorFn: (row) => row._count.reservations,
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Bookings <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono">{row.original._count.reservations}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8 gap-1 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Joined <ArrowUpDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{format(new Date(row.original.createdAt), "MMM d, yyyy")}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PassengerActionsCell row={row} />,
  },
];
