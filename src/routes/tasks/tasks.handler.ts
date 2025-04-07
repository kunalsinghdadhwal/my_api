import type { AppRouteHandler } from "@/lib/types.js";

import type { ListRoute } from "./tasks.route.js";

export const list: AppRouteHandler<ListRoute> = (c) => {
  return c.json([
    {
      name: "Learn TypeScript",
      done: false,
    },
  ]);
};
