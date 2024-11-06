FROM alpine:edge

LABEL authors="m.furuya@proship.co.jp"

# nginxのインストール  
RUN apk update && \
    apk add --no-cache nginx

# ドキュメントルート 
ADD ./dist/web-ui /app
ADD ./docker/build/conf/nginx.conf /etc/nginx/
ADD ./docker/build/conf/default.conf /etc/nginx/conf.d/default.conf

# ポート設定
EXPOSE 80
EXPOSE 8080
EXPOSE 443


RUN mkdir -p /run/nginx

# フォアグラウンドでnginx実行 
CMD nginx -g "daemon off;"
