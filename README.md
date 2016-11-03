##Chewb-Redis

Wrapper around [redis](https://www.npmjs.com/package/redis), with bluebird promises. This creates a client, express server, with methods to retreive data from redis.

<hr>
What is special is it can work with a local or remote redis database.

```
example.js

const { redis } = require('@samelie/chewb-redis');

let isLocal = process.env.REDIS_HOST === '127.0.0.1'

return new redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || '6379',
  project: process.env.REDIS_PROJECT //prefixes all redis key, optional
}, isLocal)

```
If `isLocal` is `false` then host must be an endpoint.
[@samelie/rad-redis](http://github.com/samelie/rad-redis) can start an express server with the expected routing.

if `isLocal` is `true` you get the same api.

Check `redis_api.js` for current methods.

<hr>

The remote redis database works well with `ngnix`. Conf for `sites-available` with symlink to `sites-enabled` below.

In this example the server is running a socket server on :8000 and the redis server on :6380



```

server {
  listen 80 ;

  listen 443 ssl default_server;
  listen [::]:443 ssl default_server;

  index index.html index.htm index.nginx-debian.html;

  server_name rad.wtf;

  location / {
    try_files $uri $uri/index.html $uri.html =404;
    index index.html index.htm;
  }

  # Requests for socket.io are passed on to Node on port 3000

  location ~* \.io {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_set_header X-NginX-Proxy true;

      proxy_pass http://127.0.0.1:8080;
      proxy_redirect off;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }

    location /redis/ {
        rewrite ^/redis/(.*) /$1 break;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

    #default rad-redis port is 6380
        proxy_pass http://127.0.0.1:6380/;
        proxy_redirect off;

    }


```



Chewb is a project grouping. No meaning aside from identification.



