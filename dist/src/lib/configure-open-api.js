import { apiReference } from "@scalar/hono-api-reference";
import packageJSON from "../../package.json";
export default function configureOpenAPI(app) {
    app.doc("/doc", {
        openapi: "3.0.0",
        info: {
            version: packageJSON.version,
            title: "Tasks API",
        },
    });
    app.get("/", apiReference({
        theme: "saturn",
        spec: {
            url: "/doc",
        },
    }));
}
