import { HomeHeroSkeleton } from "@/components/portal/loading/home-hero-skeleton";
import { HomeSectionsSkeleton } from "@/components/portal/loading/home-sections-skeleton";

// Mirrors the home page (full-width hero and search, then its sections). It lives in the (home)
// group so no other portal route can fall back to it.
export default function HomeLoading() {
  return (
    <div className="page-loading" aria-busy="true" aria-label="Loading">
      <HomeHeroSkeleton />
      <HomeSectionsSkeleton />
    </div>
  );
}
