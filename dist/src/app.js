import configureOpenAPI from "./lib/configure-open-api.js";
import createApp from "./lib/create-app.js";
import categories from "./routes/categories/categories.index.js";
import index from "./routes/index.route.js";
import stats from "./routes/stats/stats.index.js";
import subtasks from "./routes/subtasks/subtasks.index.js";
import tags from "./routes/tags/tags.index.js";
import tasks from "./routes/tasks/tasks.index.js";
const app = createApp();
configureOpenAPI(app);
const routes = [
    index,
    tasks,
    subtasks,
    categories,
    tags,
    stats,
];
routes.forEach((route) => {
    app.route("/", route);
});
export default app;
