import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";
import { z } from "zod";
import { bulkIdsSchema, bulkUpdateSchema, insertTasksSchema, patchTasksSchema, selectTasksSchema, taskQuerySchema, } from "../../db/schema.js";
import { notFoundSchema } from "../../lib/constants.js";
const tags = ["Tasks"];
// Extended task schema with relations
const taskWithRelationsSchema = selectTasksSchema.extend({
    category: z.object({
        id: z.number(),
        name: z.string(),
        color: z.string().nullable(),
    }).nullable().optional(),
    subtasks: z.array(z.object({
        id: z.number(),
        name: z.string(),
        done: z.boolean(),
        order: z.number(),
    })).optional(),
    tags: z.array(z.object({
        id: z.number(),
        name: z.string(),
        color: z.string().nullable(),
    })).optional(),
});
// Paginated response schema
const paginatedTasksSchema = z.object({
    data: z.array(taskWithRelationsSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
});
export const list = createRoute({
    path: "/tasks",
    method: "get",
    tags,
    request: {
        query: taskQuerySchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(paginatedTasksSchema, "The paginated list of tasks with filters applied"),
    },
});
export const create = createRoute({
    path: "/tasks",
    method: "post",
    tags,
    request: {
        body: jsonContentRequired(insertTasksSchema.extend({
            tagIds: z.array(z.number()).optional(),
        }), "The task to create"),
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(taskWithRelationsSchema, "The created task"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(insertTasksSchema), "The validation error"),
    },
});
export const getOne = createRoute({
    path: "/tasks/{id}",
    method: "get",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(taskWithRelationsSchema, "The requested Task with relations"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdParamsSchema), "Invalid ID"),
    },
});
export const patch = createRoute({
    path: "/tasks/{id}",
    method: "patch",
    tags,
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(patchTasksSchema.extend({
            tagIds: z.array(z.number()).optional(),
        }), "The Task to update"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(taskWithRelationsSchema, "The updated Task"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(patchTasksSchema).or(createErrorSchema(IdParamsSchema)), "Invalid Task"),
    },
});
export const remove = createRoute({
    path: "/tasks/{id}",
    method: "delete",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "Task deleted",
        },
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdParamsSchema), "Invalid id error"),
    },
});
// Toggle task completion
export const toggle = createRoute({
    path: "/tasks/{id}/toggle",
    method: "post",
    tags,
    request: {
        params: IdParamsSchema,
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(taskWithRelationsSchema, "The toggled task"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
    },
});
// Bulk update tasks
export const bulkUpdate = createRoute({
    path: "/tasks/bulk",
    method: "patch",
    tags,
    request: {
        body: jsonContentRequired(bulkUpdateSchema, "Bulk update payload"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.object({
            updated: z.number(),
            tasks: z.array(selectTasksSchema),
        }), "Number of tasks updated and the updated tasks"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(bulkUpdateSchema), "Invalid request"),
    },
});
// Bulk delete tasks
export const bulkDelete = createRoute({
    path: "/tasks/bulk",
    method: "delete",
    tags,
    request: {
        body: jsonContentRequired(bulkIdsSchema, "IDs of tasks to delete"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(z.object({ deleted: z.number() }), "Number of tasks deleted"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(bulkIdsSchema), "Invalid request"),
    },
});
// Add tags to task
export const addTags = createRoute({
    path: "/tasks/{id}/tags",
    method: "post",
    tags,
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(z.object({ tagIds: z.array(z.number()).min(1) }), "Tag IDs to add"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(taskWithRelationsSchema, "Task with updated tags"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
    },
});
// Remove tags from task
export const removeTags = createRoute({
    path: "/tasks/{id}/tags",
    method: "delete",
    tags,
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(z.object({ tagIds: z.array(z.number()).min(1) }), "Tag IDs to remove"),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(taskWithRelationsSchema, "Task with updated tags"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
    },
});
