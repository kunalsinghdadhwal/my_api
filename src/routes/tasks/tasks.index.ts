import { createRouter } from "@/lib/create-app.js";

import * as handlers from "./tasks.handler";
import * as routes from "./tasks.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.bulkUpdate, handlers.bulkUpdate)
  .openapi(routes.bulkDelete, handlers.bulkDelete)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.toggle, handlers.toggle)
  .openapi(routes.addTags, handlers.addTags)
  .openapi(routes.removeTags, handlers.removeTags);

export default router;
