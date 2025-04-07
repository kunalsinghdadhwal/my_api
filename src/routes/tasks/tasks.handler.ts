import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { ListRoute } from "./tasks.route.js";
import type { AppBindings } from "@/lib/types.js";

type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;


export const list: AppRouteHandler<ListRoute> = (c) => {
    return c.json([
        {
            name: "Learn TypeScript",
            done: false,
        }
    ])
}