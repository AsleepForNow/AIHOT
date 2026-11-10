/// <reference types="vite/client" />
import { withSiteBase, withoutSiteBase } from "@aihot/contracts/site-path";

export const webBasePath = (import.meta.env?.BASE_URL ?? "/").replace(/\/+$/, "");

/** For browser URLs outside the router, such as images, downloads and fetch(). */
export const siteHref = (href: string): string => withSiteBase(webBasePath, href);
export const siteRoute = (pathname: string): string => withoutSiteBase(webBasePath, pathname) ?? pathname;
