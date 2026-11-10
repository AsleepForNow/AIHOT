// Passes an api-owned request to the api process and streams the answer back; the web server and the
// development server both use it. Only end-to-end headers cross: the hop-by-hop ones (RFC 9110 §7.6.1)
// describe one connection, and the hop to the api is a different, pooled one.
import { request as httpRequest, type IncomingHttpHeaders, type IncomingMessage, type OutgoingHttpHeaders, type ServerResponse } from "node:http";
import { withSiteBase } from "@aihot/contracts/site-path";
import { API_BASE_URL } from "./api.server.ts";
import { logError } from "./errors.server.ts";

const API = new URL(API_BASE_URL);
const HOP_BY_HOP = ["connection", "keep-alive", "proxy-connection", "te", "transfer-encoding", "upgrade"];

/** The headers minus the hop-by-hop ones, including any the Connection header names. */
function endToEnd(headers: IncomingHttpHeaders): IncomingHttpHeaders {
  const drop = new Set([...HOP_BY_HOP, ...String(headers.connection ?? "").toLowerCase().split(",").map((name) => name.trim())]);
  return Object.fromEntries(Object.entries(headers).filter(([name]) => !drop.has(name)));
}

/** `set` replaces headers after the filter: the proxy's own facts, which a client cannot remove. */
export function proxyToApi(req: IncomingMessage, res: ServerResponse, path: string, base: string, set: OutgoingHttpHeaders = {}): void {
  const headers: OutgoingHttpHeaders = { ...endToEnd(req.headers), ...set };
  // A body without a length arrived chunked; it goes on chunked, since Node frames only some methods
  // that way by default (not DELETE, for one) and an unframed body would corrupt the pooled connection.
  if (req.headers["transfer-encoding"] && req.headers["content-length"] === undefined) headers["transfer-encoding"] = "chunked";
  const upstream = httpRequest({ hostname: API.hostname, port: API.port, path, method: req.method, headers }, (up) => {
    const response = endToEnd(up.headers);
    if (response.location) response.location = withSiteBase(base, response.location);
    res.writeHead(up.statusCode ?? 502, response);
    up.pipe(res);
  });
  upstream.on("error", (error) => {
    logError(error, { msg: "api proxy request failed", method: req.method, path: req.url });
    res.statusCode = 502;
    res.end("api unavailable");
  });
  req.pipe(upstream);
}
