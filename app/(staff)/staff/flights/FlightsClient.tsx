"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import {
  flightColumns, scheduleColumns, statusHistoryColumns,
  type FlightRow, type ScheduleRow, type StatusHistoryRow,
} from "./columns";

interface FlightsClientProps {
  flights: FlightRow[];
  schedules: ScheduleRow[];
  statusHistory: StatusHistoryRow[];
}

export function FlightsClient({ flights, schedules, statusHistory }: FlightsClientProps) {
  return (
    <Tabs defaultValue="flights" className="space-y-4">
      <TabsList className="bg-muted/50 rounded-xl">
        <TabsTrigger value="flights" className="rounded-lg text-sm">
          Flights <span className="ml-2 text-xs text-muted-foreground">({flights.length})</span>
        </TabsTrigger>
        <TabsTrigger value="schedules" className="rounded-lg text-sm">
          Schedules <span className="ml-2 text-xs text-muted-foreground">({schedules.length})</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="rounded-lg text-sm">
          Status History <span className="ml-2 text-xs text-muted-foreground">({statusHistory.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="flights">
        <DataTable
          columns={flightColumns}
          data={flights}
          searchKey="flightNumber"
          searchPlaceholder="Search flight number..."
        />
      </TabsContent>

      <TabsContent value="schedules">
        <DataTable
          columns={scheduleColumns}
          data={schedules}
          searchKey="scheduleStatus"
          searchPlaceholder="Search by status..."
        />
      </TabsContent>

      <TabsContent value="history">
        <DataTable
          columns={statusHistoryColumns}
          data={statusHistory}
          searchKey="newStatus"
          searchPlaceholder="Search by status..."
        />
      </TabsContent>
    </Tabs>
  );
}
