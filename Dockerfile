FROM golang:1.24-alpine AS builder

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -v -o /usr/local/bin/xbox-download-proxy

FROM alpine:3

WORKDIR /app
EXPOSE 8080

COPY --from=builder /usr/local/bin/xbox-download-proxy /app/xbox-download-proxy

CMD ["/app/xbox-download-proxy"]
