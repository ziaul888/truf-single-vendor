"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Loader2, Search, ShieldCheck, UserCog, UserPlus, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { UsersEmptyState, UsersTable } from "@/components/features/users/users-table";
import { UserFormSheet } from "@/components/features/users/user-form-sheet";
import { ResetPasswordDialog } from "@/components/features/users/reset-password-dialog";
import { useMe } from "@/hooks/useMe";
import { useUpdateUser, useUsers, type StaffUser } from "@/hooks/useUsers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toApiFailure } from "@/lib/api-error";
import { NoPermission } from "@/components/features/no-permission";

const PAGE_SIZE = 20;

export default function StaffPage() {
  const { data: me, isLoading: meLoading } = useMe();

  if (meLoading) return <CenteredSpinner />;
  if (me?.role !== "admin") return <NoPermission reason="Only admins can manage staff accounts." />;
  return <StaffManager currentUserId={me.id} />;
}

function StaffManager({ currentUserId }: { currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState<{ open: boolean; user: StaffUser | null }>({ open: false, user: null });
  const [resetting, setResetting] = useState<StaffUser | null>(null);
  const [deactivating, setDeactivating] = useState<StaffUser | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const users = useUsers({ page, limit: PAGE_SIZE, search: debouncedSearch });
  const update = useUpdateUser();

  async function setActive(user: StaffUser, isActive: boolean) {
    try {
      await update.mutateAsync({ id: user.id, changes: { isActive } });
      toast.success(isActive ? `${user.name} can sign in again` : `${user.name} is deactivated and signed out`);
    } catch (err) {
      toast.error(toApiFailure(err).error);
    }
  }

  function onToggleActive(user: StaffUser) {
    if (user.isActive) setDeactivating(user);
    else setActive(user, true);
  }

  const result = users.data;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Staff</h1>
            <p className="text-sm text-muted-foreground">Admin and manager accounts that can sign in to this panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/staff/roles">
              <ShieldCheck className="h-4 w-4" /> Roles
            </Link>
          </Button>
          <Button onClick={() => setSheet({ open: true, user: null })} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Staff
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="h-9 pl-9"
            aria-label="Search staff"
          />
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          {users.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
          Total: {result?.total ?? "—"}
        </div>
      </div>

      <Card className="overflow-hidden">
        {users.isLoading ? (
          <CenteredSpinner />
        ) : users.isError ? (
          <p className="px-6 py-16 text-center text-sm text-destructive">{toApiFailure(users.error).error}</p>
        ) : result && result.data.length > 0 ? (
          <UsersTable
            users={result.data}
            currentUserId={currentUserId}
            onEdit={(user) => setSheet({ open: true, user })}
            onResetPassword={setResetting}
            onToggleActive={onToggleActive}
          />
        ) : (
          <UsersEmptyState searching={!!debouncedSearch.trim()} />
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <UserFormSheet
        open={sheet.open}
        user={sheet.user}
        currentUserId={currentUserId}
        onClose={() => setSheet({ open: false, user: null })}
      />
      <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />
      <DeactivateDialog
        user={deactivating}
        onCancel={() => setDeactivating(null)}
        onConfirm={(user) => { setDeactivating(null); setActive(user, false); }}
      />
    </div>
  );
}

function DeactivateDialog({
  user, onCancel, onConfirm,
}: {
  user: StaffUser | null; onCancel: () => void; onConfirm: (user: StaffUser) => void;
}) {
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Deactivate {user?.name}?</DialogTitle>
          <DialogDescription>
            They&apos;ll be signed out on every device and can&apos;t sign in until you activate them again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={() => user && onConfirm(user)}>Deactivate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CenteredSpinner() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
