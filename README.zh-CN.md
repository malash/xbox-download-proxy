# xbox-download-proxy

[English](./README.md) | [中文](./README.zh-CN.md)

> **⚠️ 由 AI 辅助编写，请谨慎使用。**
> 本项目完全通过 AI 辅助的"氛围编程"构建，未经过生产环境审计。实现中可能存在难以察觉的 bug、不安全的默认配置或从未被考虑到的边界情况。在任何关键场景中部署前请仔细审查。

把 Xbox `.com` 下载域名改写到 `.cn` CDN 端点。一个只转发这些域名的 HTTP 正向代理，让下载走就近节点。

Xbox 在 `.com` 域名上的下载流量会被调度到境外的边缘节点。从中国大陆访问这条链路很慢，下载速度可能只有每秒几百 KB，大体积游戏包要下好几个小时。

同样的内容在 `.cn` 域名上也有发布，由国内 CDN 提供服务。请求这些域名会落到就近节点，下载速度可达每秒几十 MB。

这个代理就是把两者接起来。它位于客户端和 CDN 之间：收到针对 `assets1.xboxlive.com` 这类域名的请求时，代理转而连接 `assets1.xboxlive.cn`，并把 `assets1.xboxlive.cn` 作为 Host 头发出。这样 CDN 看到的是一个它被配置为在国内服务的域名，于是把请求交给就近节点。客户端始终请求原始的 `.com` 地址，无需做任何改动。

## 使用

```bash
npm install
npm start
```

默认监听 `0.0.0.0:8080`。

## 配置

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ASSETS_BACKEND` | `assets1.xboxlive.cn` | `assets*`、`d*`、`xvcf*` 系列域名的后端 |
| `DLASSETS_BACKEND` | `dlassets.xboxlive.cn` | `dlassets*` 系列域名的后端 |
| `LISTEN_PORT` | `8080` | 监听端口 |
| `LISTEN_ADDRESS` | `0.0.0.0` | 监听地址 |

```bash
LISTEN_PORT=9000 \
ASSETS_BACKEND=assets1.xboxlive.cn.a.bdydns.com \
node index.mjs
```

## 支持的域名

```
assets1.xboxlive.com  assets2.xboxlive.com
d1.xboxlive.com       d2.xboxlive.com
xvcf1.xboxlive.com    xvcf2.xboxlive.com
dlassets.xboxlive.com dlassets2.xboxlive.com
```

其余域名一律返回 `403`。

## 用法

以 HTTP 代理方式访问：

```bash
curl -x http://127.0.0.1:8080 \
  http://assets1.xboxlive.com/3/xxxx/Game.xvc
```

请求会以 `assets1.xboxlive.cn` 的 Host 发往 CDN。

## 说明

- 仅支持明文 HTTP，不支持 `CONNECT` / HTTPS。
- 后端域名由系统 DNS 解析。

## 许可证

[MIT](./LICENSE)
