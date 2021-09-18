"use strict";
const ctor = require("./video_stream.js");

module.exports = (options) => {
    const videoStreamResponse = ctor(options);
    return (ctx, next) => {
        ctx.video = async (videoFilePath, options) => {
            const video = await videoStreamResponse(videoFilePath, ctx.headers.range, options);

            ctx.status = video.statusCode;

            for (const headerName of Object.keys(video.header)) {
                ctx.set(headerName, video.header[headerName]);
            }        

            ctx.body = video.body;
        };

        return next();
    };
};
