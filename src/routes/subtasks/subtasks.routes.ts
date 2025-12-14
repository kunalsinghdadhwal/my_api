import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";
import { z } from "zod";

import { insertSubtasksSchema, patchSubtasksSchema, selectSubtasksSchema } from "@/db/schema.js";
import { notFoundSchema } from "@/lib/constants.js";

const tags = ["Subtasks"];

// Nested route params schema
const TaskIdParamsSchema = z.object({
  taskId: z.coerce.number().openapi({
    param: { name: "taskId", in: "path" },
    example: 1,
  }),
});

const SubtaskParamsSchema = TaskIdParamsSchema.extend({
  id: z.coerce.number().openapi({
    param: { name: "id", in: "path" },
    example: 1,
  }),
});

export const list = createRoute({
  path: "/tasks/{taskId}/subtasks",
  method: "get",
  tags,
  request: {
    params: TaskIdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectSubtasksSchema),
      "The list of subtasks for this task",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
  },
});

export const create = createRoute({
  path: "/tasks/{taskId}/subtasks",
  method: "post",
  tags,
  request: {
    params: TaskIdParamsSchema,
    body: jsonContentRequired(
      insertSubtasksSchema.omit({ taskId: true }),
      "The subtask to create",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectSubtasksSchema,
      "The created subtask",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSubtasksSchema),
      "The validation error",
    ),
  },
});

export const getOne = createRoute({
  path: "/tasks/{taskId}/subtasks/{id}",
  method: "get",
  tags,
  request: {
    params: SubtaskParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSubtasksSchema,
      "The requested subtask",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Subtask not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SubtaskParamsSchema),
      "Invalid ID",
    ),
  },
});

export const patch = createRoute({
  path: "/tasks/{taskId}/subtasks/{id}",
  method: "patch",
  tags,
  request: {
    params: SubtaskParamsSchema,
    body: jsonContentRequired(
      patchSubtasksSchema,
      "The subtask to update",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSubtasksSchema,
      "The updated subtask",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Subtask not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSubtasksSchema).or(createErrorSchema(SubtaskParamsSchema)),
      "Invalid subtask",
    ),
  },
});

export const remove = createRoute({
  path: "/tasks/{taskId}/subtasks/{id}",
  method: "delete",
  tags,
  request: {
    params: SubtaskParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Subtask deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Subtask not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SubtaskParamsSchema),
      "Invalid id error",
    ),
  },
});

// Toggle subtask completion
export const toggle = createRoute({
  path: "/tasks/{taskId}/subtasks/{id}/toggle",
  method: "post",
  tags,
  request: {
    params: SubtaskParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSubtasksSchema,
      "The toggled subtask",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Subtask not found",
    ),
  },
});

// Reorder subtasks
const ReorderSchema = z.object({
  subtaskIds: z.array(z.number()).min(1),
});

export const reorder = createRoute({
  path: "/tasks/{taskId}/subtasks/reorder",
  method: "post",
  tags,
  request: {
    params: TaskIdParamsSchema,
    body: jsonContentRequired(
      ReorderSchema,
      "The new order of subtask IDs",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectSubtasksSchema),
      "The reordered subtasks",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ReorderSchema),
      "Invalid request",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type ToggleRoute = typeof toggle;
export type ReorderRoute = typeof reorder;
