import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { isApiOwned, resolveRedirect } from "@aihot/contracts/http-policy";
import { siteBasePath, withSiteBase, withoutSiteBase } from "@aihot/contracts/site-path";
import { DEPLOYMENT } from "@aihot/site";
import { proxyToApi } from "./app/lib/api-proxy.server.ts";

const base = siteBasePath(process.env.SITE_URL);

/** Development stand-in for the production web server: the shared redirect table and api-owned path routing. */
function devEdge(): Plugin {
  return {
    name: "aihot-dev-edge",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? "/";
        const qi = raw.indexOf("?");
        const pathname = withoutSiteBase(base, qi >= 0 ? raw.slice(0, qi) : raw);
        const search = qi >= 0 ? raw.slice(qi) : "";
        if (pathname === null) return next();
        if (pathname.startsWith("/@") || pathname.startsWith("/node_modules/") || pathname.startsWith("/app/") || pathname.startsWith("/__")) return next();
        const decision = resolveRedirect(pathname, search);
        if (decision) {
          for (const [k, v] of Object.entries(decision.headers)) res.setHeader(k, v);
          if (decision.location) res.setHeader("Location", withSiteBase(base, decision.location));
          res.statusCode = decision.status;
          return res.end();
        }
        if (!isApiOwned(pathname)) return next();
        // The api sees the Host it gets in production.
        if (DEPLOYMENT.originHost) req.headers.host = DEPLOYMENT.originHost;
        proxyToApi(req, res, pathname + search, base);
      });
    },
  };
}

export default defineConfig({
  base: base + "/",
  plugins: [devEdge(), tailwindcss(), reactRouter()],
  // The modules' pages import the engine's web code by this name (tsconfig.json paths).
  resolve: { alias: { "@aihot/web/": `${path.resolve(import.meta.dirname, "app")}/` } },
  server: { port: 3000, strictPort: true },
  build: {
    rolldownOptions: {
      output: {
        // Keep the framework stable across releases and reused shell code in one browser cache
        // entry, including the site and industry packages and the search every page mounts. Feature
        // code shares only with its users: admin pages do not need to download the public feed and
        // article readers. Every file is one more request a new reader makes, so the feed pages'
        // components travel together instead of one file each.
        codeSplitting: {
          groups: [
            { name: "framework", test: /node_modules[\\/](?:react|react-dom|scheduler|react-router|@react-router|cookie|set-cookie-parser|turbo-stream)[\\/]/, priority: 30 },
            { name: "motion", test: /node_modules[\\/](?:motion|framer-motion|motion-dom|motion-utils)[\\/]/, priority: 20 },
            { name: "shared", test: /apps[\\/]web[\\/]app[\\/](?:(?!features[\\/]|routes[\\/])|features[\\/]search[\\/])|[\\/](?:industry|site)[\\/]/, minShareCount: 2, priority: 10 },
            { name: "feed", test: /apps[\\/]web[\\/]app[\\/]features[\\/](?:feed[\\/]|hot[\\/]|item[\\/]preview\.)/, minShareCount: 2, priority: 10 },
          ],
        },
      },
    },
  },
});
