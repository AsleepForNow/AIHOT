/** The site's mount path, without a trailing slash. An origin-only URL mounts at the root. */
export function siteBasePath(siteUrl: string | undefined): string {
  return siteUrl ? new URL(siteUrl).pathname.replace(/\/+$/, "") : "";
}

export function withSiteBase(base: string, href: string): string {
  return /^\/(?!\/)/.test(href) ? base + href : href;
}

/** Returns the route path within the mount, or null for a path outside it. */
export function withoutSiteBase(base: string, pathname: string): string | null {
  if (!base) return pathname;
  if (pathname === base) return "/";
  return pathname.startsWith(base + "/") ? pathname.slice(base.length) : null;
}
