/// <reference types="node" />

interface VideoOption {
    basePath?: string;
    maxChunkSize?: number;
}

declare global {
    namespace Express {
        interface Response {
            video(filePath: string, callback?: (err: Error) => void): Promise<void>;
            video(filePath: string, options: VideoOption | null, callback?: (err: Error) => void): Promise<void>; 
        }
    }
}

declare module "koa" {
    interface DefaultContext {
        video(filePath: string, options?: VideoOption): Promise<void>;
    }
}

declare module "fastify" {
    interface FastifyReply {
        video(filePath: string, options?: VideoOption): Promise<void>;
    }
}

export function express(options?: VideoOption): any;
export function koa(options?: VideoOption): any;
export function fastify(options?: VideoOption): any;
