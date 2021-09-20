# simple_video_response
node video response

## express
```javascript
var express = require('express');
var app = express();
app.use(require('simple_video_response').express());
app.get('/', (req, res, next) => {
    res.video(__dirname + '/example.mp4');
});

app.listen(3000);
```

## koa
```javascript
var Koa = require('koa');
var app = new Koa();
app.use(require('simple_video_response').koa());
app.use(ctx => {
    return ctx.video(__dirname + '/example.mp4');
});

app.listen(3000);
```

## fastify
```javascript
var fastify = require('fastify')();
fastify.register(require('simple_video_response').fastify());
fastify.get('/', (request, reply) => {
    reply.video(__dirname + '/example.mp4');
});
fastify.listen(3000);
```

## option 
```javascript
require('simple_video_response').express({
    basePath: "", // path to read file dir ( path.join(bathPath, "example.mp4") )
    fileStatCache: true, // caches file info (fs.stats)
    maxChunkSize: 1234567, // maximum sent chunk at one request
})
```
