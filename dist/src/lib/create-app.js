import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { rateLimiter } from "hono-rate-limiter";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { parseEnv } from "../env.js";
import { pinoLogger } from "../middlewares/pino-logger.js";
export function createRouter() {
    return new OpenAPIHono({
        strict: false,
        defaultHook,
    });
}
export default function createApp() {
    const app = createRouter();
    app.use((c, next) => {
        // eslint-disable-next-line node/no-process-env
        c.env = parseEnv(Object.assign(c.env || {}, process.env));
        return next();
    });
    // CORS middleware - allow all origins in development
    app.use(cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposeHeaders: ["X-Total-Count", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
        maxAge: 86400,
        credentials: true,
    }));
    // Rate limiting middleware
    app.use(rateLimiter({
        windowMs: 60 * 1000, // 1 minute window
        limit: 100, // 100 requests per minute
        standardHeaders: "draft-6",
        keyGenerator: c => c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "anonymous",
    }));
    app.use(serveEmojiFavicon("📝"));
    app.use(pinoLogger());
    app.notFound(notFound);
    app.onError(onError);
    return app;
}
export function createTestApp(router) {
    return createApp().route("/", router);
}
