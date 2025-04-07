import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib/create-app.js";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatus from "stoker/http-status-codes";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

const router = createRouter().openapi(createRoute({
  method: "get",
  tags: ["Index"],
  path: "/",
  responses: {
      [HttpStatus.OK]: jsonContent(
          createMessageObjectSchema("Tasks API")
      ,
          "Tasks API Index"
      )
      ,
  },
}), (c) => {
  return c.json({
    message: "Tasks API Index",
  }, HttpStatus.OK);
});

export default router;
