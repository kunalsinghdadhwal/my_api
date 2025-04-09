import { createRouter } from "@/lib/create-app.js";

import * as handlers from "./tasks.handler";
import * as routes from "./tasks.route";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
