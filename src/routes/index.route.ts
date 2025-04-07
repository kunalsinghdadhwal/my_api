import { createRouter } from "@/lib/create-app.js";
import { createRoute, z } from "@hono/zod-openapi";

const router = createRouter().openapi(createRoute({
    method: "get",
    path: "/",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                }
            },
            description: "Tasks API Index"
        },

    }
}),
    (c) => {
      return c.json({
        message: "Tasks API Index",
      });  
    }

);

export default router;