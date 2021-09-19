"use strict";
const ctor = require("./video_stream.js");

module.exports = (options) => {
    const videoStreamResponse = ctor(options);
    const middleware = function (fastify, opts, done) {
        fastify.decorateReply("video", async function (filePath, options) {
            const reply = this;
            const request = this.request;
            const r = await videoStreamResponse(filePath, request.headers.range, options);
            reply.headers(r.header);
            reply.statusCode = r.statusCode;
            reply.send(r.body);
            return this;
        });
        done();
    };
    
    middleware[Symbol.for("skip-override")] = true;

    return middleware;
};

