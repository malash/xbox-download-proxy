import net from "node:net";
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

proxy.onConnect((req, socket, head, callback) => {
  const hostname = req.url.split(":")[0].toLowerCase();
  if (ALLOWED_HOSTS.has(hostname)) {
    return callback();
  }

  const [host, port] = req.url.split(":");
  const upstream = net.connect(Number(port) || 80, host, () => {
    socket.write("HTTP/1.1 200 Connection established\r\n\r\n");
    if (head.length) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });

  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

proxy.onRequest(async (ctx, callback) => {
  const hostname = ctx.clientToProxyRequest.headers.host
    .split(":")[0]
    .toLowerCase();

  if (!ALLOWED_HOSTS.has(hostname)) {
    callback();
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

  process.nextTick(() => {
    ctx.clientToProxyRequest.socket.once("close", () => {
      ctx.proxyToServerRequest?.destroy();
    });
  });
});

proxy.listen({ port: LISTEN_PORT, host: LISTEN_ADDRESS });
console.log(`listening ${LISTEN_ADDRESS}:${LISTEN_PORT}`);
