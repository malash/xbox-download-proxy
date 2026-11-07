# xbox-download-proxy

[English](./README.md) | [中文](./README.zh-CN.md)

> **⚠️ Vibe coded — use with caution.**
> Built through AI-assisted vibe coding and not audited for production use. Review before deploying in any critical context.

Rewrites Xbox `.com` download hosts to the domestic `.cn` CDN, so downloads are served from a nearby edge node instead of an overseas one.

## Usage

```bash
go build -o xbox-download-proxy
./xbox-download-proxy
```

Or with Docker:

```bash
docker build -t xbox-download-proxy .
docker run -p 8080:8080 xbox-download-proxy
```

Use it as an HTTP proxy:

```bash
curl -x http://127.0.0.1:8080 \
  http://assets1.xboxlive.com/3/xxxx/Game.xvc
```

The request reaches the CDN with `assets1.xboxlive.cn` as its Host.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `ASSETS_BACKEND` | `assets1.xboxlive.cn` | Backend for `assets*`, `d*`, `xvcf*` domains |
| `DLASSETS_BACKEND` | `dlassets.xboxlive.cn` | Backend for `dlassets*` domains |
| `LISTEN_PORT` | `8080` | Listen port |
| `LISTEN_ADDRESS` | `0.0.0.0` | Listen address |
| `PROXY_USERNAME` | _(empty)_ | Basic auth username |
| `PROXY_PASSWORD` | _(empty)_ | Basic auth password |

Set both to require HTTP Basic auth (`407` otherwise); leave both empty to disable it. Setting only one refuses to start.

```bash
LISTEN_PORT=9000 \
ASSETS_BACKEND=assets1.xboxlive.cn.a.bdydns.com \
PROXY_USERNAME=alice PROXY_PASSWORD=secret \
./xbox-download-proxy
```

Credentials are sent in plaintext — use a trusted network or put TLS in front of the proxy.

## Supported domains

```
assets1.xboxlive.com  assets2.xboxlive.com
d1.xboxlive.com       d2.xboxlive.com
xvcf1.xboxlive.com    xvcf2.xboxlive.com
dlassets.xboxlive.com dlassets2.xboxlive.com
```

Any other domain is forwarded unchanged.

## Notes

- Plaintext HTTP only. HTTPS (`CONNECT` to port 443) is forwarded untouched, without Host rewriting.
- Backend hostnames are resolved through the system DNS.

## License

[MIT](./LICENSE)
