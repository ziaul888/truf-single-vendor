import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { settings: { next: { rootDir: ["apps/admin/", "apps/portal/", "apps/saas/", "apps/platform/"] } } },
];

export default eslintConfig;
