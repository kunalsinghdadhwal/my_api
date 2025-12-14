import { createRouter } from "../../lib/create-app.js";
import * as handlers from "./stats.handler.js";
import * as routes from "./stats.routes.js";
const router = createRouter()
    .openapi(routes.dashboard, handlers.dashboard)
    .openapi(routes.productivity, handlers.productivity);
export default router;
