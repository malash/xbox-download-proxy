# xbox-download-proxy

[English](./README.md) | [中文](./README.zh-CN.md)

> **⚠️ Vibe coded — use with caution.**
> This project was built entirely through AI-assisted vibe coding and has not been audited for production use. The implementation may contain subtle bugs, insecure defaults, or edge cases that were never considered. Review carefully before deploying in any critical context.

Rewrites Xbox `.com` download hosts to `.cn` CDN endpoints. An HTTP forward proxy that only forwards those domains, so downloads are served from a closer edge node.

Xbox download traffic on the `.com` domains is routed to overseas edge nodes. From mainland China that path is slow — a download can crawl along at a fraction of a megabyte per second, and large game packages take hours.

The same content is also published on the `.cn` domains, which are served by a domestic CDN. Requests to those domains land on a nearby node and download at tens of megabytes per second.

This proxy bridges the two. It sits between the client and the CDN. When a request comes in for something like `assets1.xboxlive.com`, the proxy connects to `assets1.xboxlive.cn` instead and sends `assets1.xboxlive.cn` as the Host header. The CDN therefore sees a request for a domain it is configured to serve domestically, and hands it to a nearby edge node. The client keeps requesting the original `.com` address and does not need to change anything.

## Usage

```bash
npm install
npm start
```

Listens on `0.0.0.0:8080` by default.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `ASSETS_BACKEND` | `assets1.xboxlive.cn` | Backend for `assets*`, `d*`, `xvcf*` domains |
| `DLASSETS_BACKEND` | `dlassets.xboxlive.cn` | Backend for `dlassets*` domains |
| `LISTEN_PORT` | `8080` | Listen port |
| `LISTEN_ADDRESS` | `0.0.0.0` | Listen address |

```bash
LISTEN_PORT=9000 \
ASSETS_BACKEND=assets1.xboxlive.cn.a.bdydns.com \
node index.mjs
```

## Supported domains

```
assets1.xboxlive.com  assets2.xboxlive.com
d1.xboxlive.com       d2.xboxlive.com
xvcf1.xboxlive.com    xvcf2.xboxlive.com
dlassets.xboxlive.com dlassets2.xboxlive.com
```

Any other domain gets `403`.

## Usage

Use it as an HTTP proxy:

```bash
curl -x http://127.0.0.1:8080 \
  http://assets1.xboxlive.com/3/xxxx/Game.xvc
```

The request reaches the CDN with `assets1.xboxlive.cn` as its Host.

## Notes

- Plaintext HTTP only. `CONNECT` / HTTPS is not supported.
- Backend hostnames are resolved through the system DNS.

## License

[MIT](./LICENSE)
