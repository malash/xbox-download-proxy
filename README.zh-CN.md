# xbox-download-proxy

[English](./README.md) | [中文](./README.zh-CN.md)

> **⚠️ 由 AI 辅助编写，请谨慎使用。**
> 本项目通过 AI 辅助的"氛围编程"构建，未经过生产环境审计。部署到关键场景前请仔细审查。

把 Xbox `.com` 下载域名改写到国内 `.cn` CDN，让下载走就近节点而不是境外节点。

## 使用

```bash
go build -o xbox-download-proxy
./xbox-download-proxy
```

或者用 Docker：

```bash
docker build -t xbox-download-proxy .
docker run -p 8080:8080 xbox-download-proxy
```

以 HTTP 代理方式访问：

```bash
curl -x http://127.0.0.1:8080 \
  http://assets1.xboxlive.com/3/xxxx/Game.xvc
```

请求会以 `assets1.xboxlive.cn` 的 Host 发往 CDN。

## 配置

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ASSETS_BACKEND` | `assets1.xboxlive.cn` | `assets*`、`d*`、`xvcf*` 系列域名的后端 |
| `DLASSETS_BACKEND` | `dlassets.xboxlive.cn` | `dlassets*` 系列域名的后端 |
| `LISTEN_PORT` | `8080` | 监听端口 |
| `LISTEN_ADDRESS` | `0.0.0.0` | 监听地址 |
| `PROXY_USERNAME` | _（空）_ | Basic 认证用户名 |
| `PROXY_PASSWORD` | _（空）_ | Basic 认证密码 |

两者都设置时要求 HTTP Basic 认证（否则返回 `407`）；都为空则关闭认证；只设置一个时拒绝启动。

```bash
LISTEN_PORT=9000 \
ASSETS_BACKEND=assets1.xboxlive.cn.a.bdydns.com \
PROXY_USERNAME=alice PROXY_PASSWORD=secret \
./xbox-download-proxy
```

凭据以明文传输：请在可信网络中使用，或在代理前面加一层 TLS。

## 支持的域名

```
assets1.xboxlive.com  assets2.xboxlive.com
d1.xboxlive.com       d2.xboxlive.com
xvcf1.xboxlive.com    xvcf2.xboxlive.com
dlassets.xboxlive.com dlassets2.xboxlive.com
```

其余域名原样转发。

## 说明

- 仅支持明文 HTTP。HTTPS（`CONNECT` 到 443 端口）会原样转发，不改写 Host。
- 后端域名由系统 DNS 解析。

## 许可证

[MIT](./LICENSE)
