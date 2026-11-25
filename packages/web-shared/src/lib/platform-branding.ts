export interface PlatformBranding {
  title: string;
  subtitle: string;
  logoUrl: string | null;
}

export const DEFAULT_PLATFORM_BRANDING: PlatformBranding = {
  title: "SaaS Admin",
  subtitle: "Platform administration",
  logoUrl: null,
};
