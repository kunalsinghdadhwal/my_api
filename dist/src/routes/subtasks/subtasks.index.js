import { createRouter } from "../../lib/create-app.js";
import * as handlers from "./subtasks.handler.js";
import * as routes from "./subtasks.routes.js";
const router = createRouter()
    .openapi(routes.list, handlers.list)
    .openapi(routes.reorder, handlers.reorder)
    .openapi(routes.create, handlers.create)
    .openapi(routes.getOne, handlers.getOne)
    .openapi(routes.patch, handlers.patch)
    .openapi(routes.remove, handlers.remove)
    .openapi(routes.toggle, handlers.toggle);
export default router;
