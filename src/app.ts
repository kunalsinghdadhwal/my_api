import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import categories from "@/routes/categories/categories.index";
import index from "@/routes/index.route";
import stats from "@/routes/stats/stats.index";
import subtasks from "@/routes/subtasks/subtasks.index";
import tags from "@/routes/tags/tags.index";
import tasks from "@/routes/tasks/tasks.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  tasks,
  subtasks,
  categories,
  tags,
  stats,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
