
"use strict";
const fs = require("fs");
const path = require("path");
const util = require("util")
const fsStat = util.promisify(fs.stat);

const isDebug = (() => {
    if (require('inspector').url()) {
        return true;
    }
    return false;
})();


const fileCache = {};

const getExt = (filePath) =>{
    const ext = path.extname(filePath);
    if (ext && ext.length > 0) {
        return ext.substring(1);
    }
    return "mp4";
};

// size, ext
const loadFileSizeAndExt = async (filePath) => {
    const fileStat = await fsStat(filePath);
    const ext = getExt(filePath);
    return {
        size: fileStat.size,
        ext: ext,
    };
};

const getFileSizeAndExt = async (filePath) => {
    const cacheStat = fileCache[filePath];
    if (cacheStat) {
        return cacheStat;
    }

    const info = await loadFileSizeAndExt(filePath);
    fileCache[filePath] = info;
    return info;
};

let DEFAULT_STREAM_OPTIONS = {
    basePath: "",
    fileStatCache: isDebug,
    maxChunkSize: Number.MAX_SAFE_INTEGER,
    fileSizeAndExtFn: null,
};

const videoStreamResponse = async (filePath, httpRangeHeader, options) => {
    options = Object.assign({}, DEFAULT_STREAM_OPTIONS, options);
    filePath = path.join(String(options.basePath), filePath);
    
    const fileInfo = await options.fileSizeAndExtFn(filePath);
    const fileSize = fileInfo.size;
    const contentType = "video/" + fileInfo.ext;

    if (!httpRangeHeader) {
        return {
            statusCode: 200,
            header: {
                'Content-Length': fileSize,
                'Content-Type': contentType,
            }, 
            body: " ",
        };
    }

    const byteRanges = /bytes=([0-9]+)\-([0-9]+)?/.exec(httpRangeHeader); 
    const start = parseInt(byteRanges[1]);
    let end = fileSize - 1;
    if (byteRanges[2] && byteRanges[2].length > 0) {
        end = parseInt(byteRanges[2]);
    }
    end = Math.min(end, start + options.maxChunkSize);

    const chunksize = (end - start) + 1;
    const readStream = fs.createReadStream(filePath, { start, end });
    return {
        statusCode: 206,
        header: {
            'Content-Length': chunksize,
            'Content-Type': contentType,
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
        }, 
        body: readStream,
    };
};

module.exports = (defaultOptions) => {
    DEFAULT_STREAM_OPTIONS = Object.assign({}, DEFAULT_STREAM_OPTIONS, defaultOptions);

    if (DEFAULT_STREAM_OPTIONS.fileStatCache) {
        DEFAULT_STREAM_OPTIONS.fileSizeAndExtFn = getFileSizeAndExt;
    } else {
        DEFAULT_STREAM_OPTIONS.fileSizeAndExtFn = loadFileSizeAndExt; 
    }

    return videoStreamResponse;
};
