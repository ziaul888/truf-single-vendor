/** Sends the browser to /login, remembering the current page so login can return to it. */
export function redirectToLogin() {
  if (typeof window === "undefined") return;
  const from = encodeURIComponent(window.location.pathname);
  window.location.href = `/login?from=${from}`;
}
