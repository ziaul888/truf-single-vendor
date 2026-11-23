"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers3, RefreshCw, ShieldCheck } from "lucide-react";
import { PlanFeaturesList } from "@/components/plan-features-list";
import { Button } from "@/components/ui/button";
import { formatBdt, planCharge } from "@/lib/platform-billing";
import type { BillingInterval } from "@/types/platform-billing";
import { BillingCycleToggle, useOwnerApplicationPlans } from "./owner-application-plans";

export function SaasPricing() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const plans = useOwnerApplicationPlans();

  return (
    <section id="plans" className="saas-pricing saas-section-space" aria-labelledby="plans-heading">
      <div className="saas-container">
        <div className="saas-section-heading">
          <div>
            <p className="saas-eyebrow">Your business. Your pace.</p>
            <h2 id="plans-heading" className="saas-section mt-4">
              A simple plan for
              <br />
              your next chapter.
            </h2>
            <p className="saas-lead mt-5 max-w-[46ch]">
              One subscription for your turf business. Choose the billing cycle that works for you.
            </p>
          </div>
          <div className="w-full max-w-xs lg:pb-1">
            <BillingCycleToggle interval={interval} onInterval={setInterval} />
            <p className="text-muted-foreground mt-3 text-center text-xs" aria-live="polite">
              {interval === "monthly" ? "Billed monthly" : "Billed yearly"}. All prices in BDT.
            </p>
          </div>
        </div>

        <div className="mt-10 lg:mt-12">
          {plans.isPending ? (
            <div role="status">
              <span className="sr-only">Loading subscription options…</span>
              <div className="saas-plan-grid" aria-hidden>
                {[0, 1, 2].map((index) => (
                  <div key={index} className="saas-plan-card saas-plan-loading">
                    <div className="bg-muted h-4 w-20 rounded" />
                    <div className="bg-muted mt-8 h-7 w-32 rounded" />
                    <div className="bg-muted mt-3 h-4 w-4/5 rounded" />
                    <div className="bg-muted mt-8 h-12 w-40 rounded" />
                    <div className="bg-muted mt-auto h-11 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : plans.isError ? (
            <div
              role="alert"
              className="bg-card flex flex-col items-start justify-between gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:p-8"
            >
              <div>
                <h3 className="font-semibold">Plans couldn’t load right now.</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Please try again to see the latest subscription options.
                </p>
              </div>
              <Button
                variant="outline"
                className="saas-button h-11 shrink-0"
                onClick={() => void plans.refetch()}
              >
                <RefreshCw aria-hidden /> Try again
              </Button>
            </div>
          ) : plans.data?.length ? (
            <>
              <div className="saas-plan-grid">
                {plans.data.map((plan) => (
                  <article key={plan.id} className="saas-plan-card">
                    <div className="saas-plan-label">
                      <Layers3 aria-hidden className="size-5" />
                      <span>One turf business</span>
                    </div>
                    <h3 className="saas-title break-words">{plan.name}</h3>
                    <p className="text-muted-foreground mt-3 min-h-12 text-sm leading-relaxed break-words">
                      {plan.description}
                    </p>
                    <p className="saas-plan-price">
                      <span className="saas-numeral">
                        {plan.trialDays ? "Free" : formatBdt(planCharge(plan, interval))}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.trialDays
                          ? `for ${plan.trialDays} days`
                          : `/ ${interval === "monthly" ? "month" : "year"}`}
                      </span>
                    </p>
                    <PlanFeaturesList features={plan.features} className="saas-plan-features" />
                    <div className="mt-auto pt-8">
                      <Button
                        asChild
                        className="saas-button h-auto min-h-12 w-full px-4 py-3 text-center whitespace-normal"
                      >
                        <Link
                          href={`/saas/apply?plan=${encodeURIComponent(plan.id)}&interval=${interval}`}
                        >
                          Apply for {plan.name}
                          <ArrowRight aria-hidden />
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="saas-price-note">
                <ShieldCheck aria-hidden className="size-4" /> Trial plans start after approval. For
                paid plans, you can apply before paying.
              </p>
            </>
          ) : (
            <div className="bg-card rounded-2xl border border-dashed p-8 text-center">
              <h3 className="font-semibold">Subscription plans are on their way.</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                No plans are open for purchase yet. Please check back for available options.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
