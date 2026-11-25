// Fallback while a portal page the router hasn't prefetched renders. Every route has its own
// matching loading.tsx, so this stays empty rather than flash some other page's layout.
export default function PortalLoading() {
  return <div className="page-loading min-h-[60vh]" aria-busy="true" aria-label="Loading" />;
}
