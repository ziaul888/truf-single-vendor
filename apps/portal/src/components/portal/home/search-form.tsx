"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * A GET search form that navigates inside the app. A plain form submit reloads the whole document,
 * which flashes the unthemed page background before the new page renders. Without JavaScript it
 * still submits as an ordinary form.
 */
export function SearchForm({
  id, action, className, children,
}: {
  id: string; action: string; className?: string; children: React.ReactNode;
}) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value) params.set(name, value);
    }
    const query = params.toString();
    router.push(query ? `${action}?${query}` : action);
  }

  return (
    <form id={id} action={action} onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
