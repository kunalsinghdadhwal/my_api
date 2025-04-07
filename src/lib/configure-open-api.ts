import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types.js";

import packageJson from "../../package.json";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: "Tasks API",
      version: packageJson.version,
    },
  });

  app.get("/reference", Scalar({
    theme: "saturn",
    url: "/doc",
  }));
}
