"use strict";

const ctor = require("./video_stream.js");
const emptyFunction = () => {};

module.exports = (options) => {
    const videoStreamResponse = ctor(options);
    return (req, res, next) => {
        res.video = (videoFilePath, ...args) => {
            let err;
            let video;
            let options;
            let callback = emptyFunction;

            if (args.length === 1) {
                callback = args[0];
            } else if (args.length > 2) {
                options = args[0];
                callback = args[1];
            }

            if (typeof emptyFunction !== "function") {
                throw new Error("callback is not function");
            }

            return new Promise(async (resolve, reject) => {

                const onClose = () => {
                    if (callback && typeof callback === "function") {
                        callback(err);
                    }

                    if (video && video.statusCode === 206) {
                        video.body.destroy();
                    }

                    video = null;

                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                };

                try {
                    video = await videoStreamResponse(videoFilePath, req.headers.range, options);

                    for (const headerName of Object.keys(video.header)) {
                        res.setHeader(headerName, video.header[headerName]);
                    }

                    res.statusCode = video.statusCode;
                    if (video.statusCode === 206) {
                        video.body.pipe(res);
                    } else {
                        res.write(video.body);
                    }
                } catch(e) {
                    err = e;
                } finally {
                    if (video && video.statusCode === 206) {
                        video.body.on("close", onClose);
                        video.body.on("error", (err) => {
                            err = e;
                            onClose();
                        });
                    } else {
                        onClose();
                    }
                }
            });
        };
        
        next();
    };
};
