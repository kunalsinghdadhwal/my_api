import { createRoute } from "@hono/zod-openapi";
import * as HttpStatus from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";

const list = createRoute({
  path: "/tasks",
  method: "get",
  tags: ["Tasks"],
  responses: {
    [HttpStatus.OK]: jsonContent(
      z.array(z.object({
        name: z.string(),
        done: z.boolean(),
      })),
      "The list of tasks",
    ),
  },
});

export type ListRoute = typeof list;
