import { createRouter } from "@/lib/create-app";

import * as handlers from "./stats.handler";
import * as routes from "./stats.routes";

const router = createRouter()
  .openapi(routes.dashboard, handlers.dashboard)
  .openapi(routes.productivity, handlers.productivity);

export default router;
