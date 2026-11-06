import { Proxy } from "http-mitm-proxy";

const ASSETS_BACKEND = process.env.ASSETS_BACKEND || "assets1.xboxlive.cn";
const DLASSETS_BACKEND = process.env.DLASSETS_BACKEND || "dlassets.xboxlive.cn";
const LISTEN_PORT = Number(process.env.LISTEN_PORT) || 8080;
const LISTEN_ADDRESS = process.env.LISTEN_ADDRESS || "0.0.0.0";

const ALLOWED_HOSTS = new Set([
  "assets1.xboxlive.com",
  "assets2.xboxlive.com",
  "d1.xboxlive.com",
  "d2.xboxlive.com",
  "xvcf1.xboxlive.com",
  "xvcf2.xboxlive.com",
  "dlassets.xboxlive.com",
  "dlassets2.xboxlive.com",
]);

const DLASSETS_HOSTS = new Set(["dlassets.xboxlive.com", "dlassets2.xboxlive.com"]);

const proxy = new Proxy();

proxy.onRequest(async (ctx, callback) => {
  const hostname = ctx.clientToProxyRequest.headers.host
    .split(":")[0]
    .toLowerCase();

  if (!ALLOWED_HOSTS.has(hostname)) {
    ctx.proxyToClientResponse.writeHead(403);
    ctx.proxyToClientResponse.end();
    return;
  }

  const isDlassets = DLASSETS_HOSTS.has(hostname);
  const backend = isDlassets ? DLASSETS_BACKEND : ASSETS_BACKEND;
  const requestOptions = ctx.proxyToServerRequestOptions;
  requestOptions.host = backend;
  requestOptions.headers.host = isDlassets
    ? "dlassets.xboxlive.cn"
    : "assets1.xboxlive.cn";

  console.log(`${hostname}${ctx.clientToProxyRequest.url} -> ${backend}`);

  callback();
});

proxy.listen({ port: LISTEN_PORT, host: LISTEN_ADDRESS });
console.log(`listening ${LISTEN_ADDRESS}:${LISTEN_PORT}`);
