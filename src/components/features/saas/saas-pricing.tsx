"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatBdt, planCharge } from "@/lib/platform-billing";
import type { BillingInterval } from "@/types/platform-billing";
import { BillingCycleToggle, useOwnerApplicationPlans } from "./owner-application-plans";

export function SaasPricing() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const plans = useOwnerApplicationPlans();
  return (
    <section id="plans" className="scroll-mt-20 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <h2 className="saas-section">Choose your subscription</h2>
            <p className="saas-lead mt-5 max-w-[46ch]">
              Each subscription covers one turf business. Pay for a month or a year in BDT.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:flex lg:justify-end">
            <BillingCycleToggle interval={interval} onInterval={setInterval} />
          </div>
        </div>

        <div className="mt-14">
          {plans.isPending ? (
            <p role="status" className="text-muted-foreground">
              Loading subscription options…
            </p>
          ) : plans.isError ? (
            <div
              role="alert"
              className="border-border flex flex-wrap items-center justify-between gap-3 rounded-lg border p-6"
            >
              <p>Couldn’t load subscription options.</p>
              <Button variant="outline" className="h-11" onClick={() => void plans.refetch()}>
                Try again
              </Button>
            </div>
          ) : plans.data?.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
                {plans.data.map((plan) => (
                  <article
                    key={plan.id}
                    className="border-border bg-card hover:border-foreground/30 flex min-w-0 flex-col rounded-lg border p-6 transition-colors sm:p-8"
                  >
                    <h3 className="saas-title">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-muted-foreground mt-2 break-words">{plan.description}</p>
                    )}
                    <p className="mt-8 flex flex-wrap items-baseline gap-x-2">
                      <span className="saas-numeral text-4xl tracking-tight">
                        {formatBdt(planCharge(plan, interval))}
                      </span>
                      <span className="text-muted-foreground">
                        / {interval === "monthly" ? "month" : "year"}
                      </span>
                    </p>
                    <div className="mt-auto pt-8">
                      <Button asChild className="h-11 w-full">
                        <Link
                          href={`/saas/apply?plan=${encodeURIComponent(plan.id)}&interval=${interval}`}
                        >
                          Apply for {plan.name}
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="text-muted-foreground mt-6 text-sm">
                Full payment is required to submit your application.
              </p>
            </>
          ) : (
            <p className="border-border text-muted-foreground rounded-lg border border-dashed p-6">
              No plans are open for purchase yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
