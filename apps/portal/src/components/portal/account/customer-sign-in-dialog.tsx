"use client";

import { createContext, Suspense, useContext, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PortalLink, useTurfPortal } from "@/components/portal/turf-portal-scope";
import { CUSTOMER_SIGN_IN_QUERY } from "@/lib/customer-sign-in";
import { SignInForm } from "./sign-in-form";

const SignInContext = createContext<((trigger: HTMLAnchorElement) => void) | null>(null);

export function CustomerSignInProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const trigger = useRef<HTMLAnchorElement>(null);

  return (
    <SignInContext.Provider value={(element) => {
      trigger.current = element;
      setOpenedAt(pathname);
    }}>
      {children}
      <Suspense fallback={null}>
        <CustomerSignInDialog
          openedOnPage={openedAt === pathname}
          dismiss={() => setOpenedAt(null)}
          restoreFocus={() => {
            const target = trigger.current?.isConnected ? trigger.current : document.getElementById("portal-main");
            target?.focus({ preventScroll: true });
            trigger.current = null;
          }}
        />
      </Suspense>
    </SignInContext.Provider>
  );
}

export function CustomerSignInLink(props: Omit<ComponentProps<typeof PortalLink>, "ref" | "onNavigate">) {
  const openSignIn = useContext(SignInContext);
  const ref = useRef<HTMLAnchorElement>(null);

  return <PortalLink
    {...props}
    ref={ref}
    prefetch={false}
    aria-haspopup="dialog"
    onNavigate={(event) => {
      if (!openSignIn || !ref.current) return;
      event.preventDefault();
      openSignIn(ref.current);
    }}
  />;
}

function CustomerSignInDialog({ openedOnPage, dismiss, restoreFocus }: {
  openedOnPage: boolean;
  dismiss: () => void;
  restoreFocus: () => void;
}) {
  const fromLink = useSearchParams().get(CUSTOMER_SIGN_IN_QUERY) === "1";
  const slug = useTurfPortal()?.slug;
  const open = openedOnPage || fromLink;

  function close() {
    dismiss();
    if (fromLink) {
      const url = new URL(window.location.href);
      url.searchParams.delete(CUSTOMER_SIGN_IN_QUERY);
      window.history.replaceState(null, "", url);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogContent
        className="max-w-md gap-5 rounded-2xl bg-card p-5 sm:p-6"
        onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocus(); }}
      >
        <DialogHeader className="pr-10 max-lg:pr-10">
          <DialogTitle className="text-xl font-bold">Sign in</DialogTitle>
          <DialogDescription>
            {slug ? "Sign in to reserve slots and view your bookings at this turf." : "Sign in with a one-time code sent to your email or phone."}
          </DialogDescription>
        </DialogHeader>
        {open && <SignInForm onDone={close} />}
      </DialogContent>
    </Dialog>
  );
}
