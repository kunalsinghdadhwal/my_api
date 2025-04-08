import { createRouter } from "@/lib/create-app.js";

import * as handlers from "./tasks.handler";
import * as routes from "./tasks.route";

const router = createRouter().openapi(routes.list, handlers.list);

export default router;
