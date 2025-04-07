import createApp from "@/lib/create-app.js";
import configureOpenAPI from "./lib/configure-open-api.js";

const app = createApp();
configureOpenAPI(app);

export default app;