import { Activity, CheckCircle2, CircleDashed, Plug, Timer, XCircle } from "lucide-react";
import { formatEventTime } from "@/lib/slot-format";
import { timeAgo } from "@/components/features/bookings/booking-status-helpers";
import { SettingsSection } from "@/components/features/settings/settings-section";
import { SYSTEM_JOBS, type JobStatus, type SystemJob, type SystemStatus } from "@/types/settings";

const JOB_INFO: Record<SystemJob, { name: string; desc: string }> = {
  slotGeneration: { name: "Slot generation", desc: "Creates slots up to the booking window, hourly" },
  holdExpiry: { name: "Hold expiry", desc: "Frees slots held by unpaid checkouts" },
  completion: { name: "Booking completion", desc: "Marks past bookings as completed" },
  dueReminders: { name: "Due payment reminders", desc: "Emails customers who still owe money" },
  dueDigest: { name: "Due payments digest", desc: "Staff email from 09:00 venue time" },
};

const COUNT_LABELS: [keyof SystemStatus["counts"], string][] = [
  ["grounds", "Grounds"], ["slots", "Slots"], ["bookings", "Bookings"], ["customers", "Customers"], ["payments", "Payments"],
];

const INTEGRATIONS: [keyof SystemStatus["integrations"], string][] = [
  ["stripe", "Stripe (card payments)"], ["sendgrid", "SendGrid (email)"], ["twilio", "Twilio"],
];

function StatusLine({ ok, okText, failText }: { ok: boolean; okText: string; failText: string }) {
  return ok ? (
    <span className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /> {okText}</span>
  ) : (
    <span className="flex items-center gap-1.5 text-sm text-destructive"><XCircle className="h-4 w-4" /> {failText}</span>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

function JobRow({ job, status }: { job: SystemJob; status: JobStatus | null }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{JOB_INFO[job].name}</p>
        <p className="text-xs text-muted-foreground">{JOB_INFO[job].desc}</p>
      </div>
      {status ? (
        <div className="text-right">
          <StatusLine ok={status.ok} okText="Last run ok" failText="Last run failed" />
          <p className="text-[11px] text-muted-foreground" title={formatEventTime(status.lastRunAt)}>{timeAgo(status.lastRunAt)}</p>
          {!status.ok && status.error && <p className="max-w-xs text-[11px] text-destructive">{status.error}</p>}
        </div>
      ) : (
        <span className="flex max-w-xs items-start gap-1.5 text-xs text-muted-foreground">
          <CircleDashed className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Not run yet since the restart. Hourly jobs run within an hour.
        </span>
      )}
    </li>
  );
}

/** Version, database, record counts, background jobs and integrations. */
export function SystemHealth({ status }: { status: SystemStatus }) {
  return (
    <>
      <SettingsSection title="Health" icon={Activity}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Version"><code className="font-mono">{status.version}</code></Stat>
          <Stat label="Up since">{formatEventTime(status.startedAt)} ({timeAgo(status.startedAt)})</Stat>
          <Stat label="Database"><StatusLine ok={status.database.ok} okText="Connected" failText="Not reachable" /></Stat>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {COUNT_LABELS.map(([key, label]) => (
            <Stat key={key} label={label}>{status.counts[key].toLocaleString("en-IN")}</Stat>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Counts leave out deleted records.</p>
      </SettingsSection>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SettingsSection title="Background jobs" icon={Timer}>
          <ul className="divide-y">
            {SYSTEM_JOBS.map((job) => <JobRow key={job} job={job} status={status.jobs[job]} />)}
          </ul>
        </SettingsSection>
        <SettingsSection title="Integrations" icon={Plug} description="Keys are set in turf-api's .env">
          <ul className="divide-y">
            {INTEGRATIONS.map(([key, label]) => (
              <li key={key} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm">{label}</span>
                {status.integrations[key]
                  ? <StatusLine ok okText="Connected" failText="" />
                  : <span className="text-sm text-muted-foreground">Not set up</span>}
              </li>
            ))}
          </ul>
        </SettingsSection>
      </div>
    </>
  );
}
