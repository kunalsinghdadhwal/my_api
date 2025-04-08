import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";

import type { ListRoute } from "./tasks.route.js";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const tasks = await db.query.tasks.findMany();
  return c.json(tasks);
};
