"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useCustomerDetail, useDeleteCustomer } from "@/hooks/useCustomers";
import { useMe } from "@/hooks/useMe";
import { toApiFailure } from "@/lib/api-error";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { CustomerBookingHistory } from "@/components/features/customers/customer-booking-history";
import { CustomerDuePayments, type DuePayment } from "@/components/features/customers/customer-due-payments";
import { CollectDueDialog } from "@/components/features/customers/collect-due-dialog";
import { EditCustomerDrawer } from "@/components/features/customers/edit-customer-drawer";
import {
  CustomerContactCard, CustomerProfileHeader, CustomerQuickActions, CustomerStatCards,
} from "@/components/features/customers/customer-profile-cards";

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">{[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />)}</div>
        <div className="space-y-5">{[1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}</div>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useCustomerDetail(id);
  const { data: me } = useMe();
  const remove = useDeleteCustomer();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collecting, setCollecting] = useState<DuePayment | null>(null);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-semibold text-lg">Customer not found</p>
        <Link href="/dashboard/customers" className="text-sm text-primary underline">Back to customers</Link>
      </div>
    );
  }

  const canDelete = me?.role === "admin";
  const firstDue = data.duePayments[0];

  function handleDelete() {
    setConfirmDelete(false);
    remove.mutate(id, {
      onSuccess: () => { toast.success(`${data?.name ?? "Customer"} deleted`); router.push("/dashboard/customers"); },
      onError: (err) => toast.error(toApiFailure(err).error),
    });
  }

  const actions = { canDelete, onEdit: () => setEditOpen(true), onDelete: () => setConfirmDelete(true) };

  return (
    <div className="space-y-5">
      <Link href="/dashboard/customers" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ChevronLeft className="h-4 w-4" /> Back to customers
      </Link>

      <CustomerProfileHeader customer={data} {...actions} />
      <CustomerStatCards customer={data} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] items-start">
        <div className="space-y-5">
          <CustomerContactCard customer={data} />
          <CustomerDuePayments duePayments={data.duePayments} onCollect={setCollecting} />
          <CustomerBookingHistory customerId={data.id} bookings={data.recentBookings} />
        </div>
        <div className="space-y-5">
          <CustomerQuickActions customer={data} {...actions} onCollect={firstDue ? () => setCollecting(firstDue) : null} />
        </div>
      </div>

      {editOpen && <EditCustomerDrawer customer={data} open onOpenChange={setEditOpen} />}
      {collecting && <CollectDueDialog due={collecting} onClose={() => setCollecting(null)} />}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete customer?"
        description={`${data.name} will be removed from the customer list. Their past bookings and payments are kept.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
