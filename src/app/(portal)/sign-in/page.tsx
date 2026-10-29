import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/portal/account/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Use your mobile number to see all your bookings. No password needed.
      </p>
      <div className="mt-8">
        {/* useSearchParams (?from=) needs a Suspense boundary */}
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        You can also book without signing in. Your confirmation email has a link to each booking.
      </p>
    </div>
  );
}
