import { getStaffPayments } from "@/lib/actions/staff";
import { PaymentsClient } from "./PaymentsClient";
import { KpiCard } from "@/components/staff/KpiCard";
import { CreditCard } from "lucide-react";

export const metadata = {
  title: "Payments — Helwan Airways Staff",
};

export default async function StaffPaymentsPage() {
  const result = await getStaffPayments();
  const payments = result.success ? result.data : [];

  const total = payments.length;
  const completed = payments.filter((p) => p.status === "COMPLETED").length;
  const refunded = payments.filter((p) => p.status === "REFUNDED").length;
  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((acc, p) => acc + Number(p.amount), 0);
  const totalRefunds = payments
    .filter((p) => p.status === "REFUNDED")
    .reduce((acc, p) => acc + Number(p.refundAmount ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track transactions, revenue and refunds
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <CreditCard className="h-4 w-4" />
          <span className="text-sm font-medium">{total} Transactions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" numericValue={totalRevenue} prefix="$" sub="Completed payments" icon="revenue" color="bg-emerald-500/10 text-emerald-500" index={0} />
        <KpiCard label="Completed" numericValue={completed} sub="Successful transactions" icon="checkCircle" color="bg-blue-500/10 text-blue-500" index={1} />
        <KpiCard label="Refunded" numericValue={refunded} sub="Refund issued" icon="xCircle" color="bg-violet-500/10 text-violet-500" index={2} />
        <KpiCard label="Total Refunds" numericValue={totalRefunds} prefix="$" sub="Refund amount" icon="creditCard" color="bg-amber-500/10 text-amber-500" index={3} />
      </div>

      <PaymentsClient data={payments as never} />
    </div>
  );
}
