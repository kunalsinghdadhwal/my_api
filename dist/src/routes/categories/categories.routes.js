import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";
import { z } from "zod";
import { insertCategoriesSchema, patchCategoriesSchema, selectCategoriesSchema } from "../../db/schema.js";
import { notFoundSchema } from "../../lib/constants.js";
const tags = ["Categories"];
export const list = createRoute({
    path: "/categories",
    method: "get",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.array(selectCategoriesSchema), "The list of categories"),
    },
});
export const create = createRoute({
    path: "/categories",
    method: "post",
    tags,
    request: {
        body: jsonContentRequired(insertCategoriesSchema, "The category to create"),
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(selectCategoriesSchema, "The created category"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(insertCategoriesSchema), "The validation error"),
    },
});
export const getOne = createRoute({
    path: "/categories/{id}",
    method: "get",
    tags,
    request: {
        params: IdParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectCategoriesSchema, "The requested category"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Category not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdParamsSchema), "Invalid ID"),
    },
});
export const patch = createRoute({
    path: "/categories/{id}",
    method: "patch",
    tags,
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(patchCategoriesSchema, "The category to update"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectCategoriesSchema, "The updated category"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Category not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(patchCategoriesSchema).or(createErrorSchema(IdParamsSchema)), "Invalid category"),
    },
});
export const remove = createRoute({
    path: "/categories/{id}",
    method: "delete",
    tags,
    request: {
        params: IdParamsSchema,
    },
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "Category deleted",
        },
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Category not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdParamsSchema), "Invalid id error"),
    },
});
