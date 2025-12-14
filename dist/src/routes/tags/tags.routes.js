import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";
import { z } from "zod";
import { insertTagsSchema, patchTagsSchema, selectTagsSchema } from "../../db/schema.js";
import { notFoundSchema } from "../../lib/constants.js";
const tags = ["Tags"];
export const list = createRoute({
    path: "/tags",
    method: "get",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(selectTagsSchema), "The list of tags"),
    },
});
export const create = createRoute({
    path: "/tags",
    method: "post",
    tags,
    request: {
        body: jsonContentRequired(insertTagsSchema, "The tag to create"),
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(selectTagsSchema, "The created tag"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(insertTagsSchema), "The validation error"),
        [HttpStatusCodes.CONFLICT]: jsonContent(z.object({ message: z.string() }), "Tag with this name already exists"),
    },
});
export const getOne = createRoute({
    path: "/tags/{id}",
    method: "get",
    tags,
    request: {
        params: IdParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectTagsSchema, "The requested tag"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Tag not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdParamsSchema), "Invalid ID"),
    },
});
export const patch = createRoute({
    path: "/tags/{id}",
    method: "patch",
    tags,
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(patchTagsSchema, "The tag to update"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectTagsSchema, "The updated tag"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Tag not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(patchTagsSchema).or(createErrorSchema(IdParamsSchema)), "Invalid tag"),
    },
});
export const remove = createRoute({
    path: "/tags/{id}",
    method: "delete",
    tags,
    request: {
        params: IdParamsSchema,
    },
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "Tag deleted",
        },
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Tag not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdParamsSchema), "Invalid id error"),
    },
});
