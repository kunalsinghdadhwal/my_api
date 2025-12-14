import { and, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "../../db/index.js";
import { subtasks } from "../../db/schema.js";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../lib/constants.js";
// Helper to check if parent task exists
async function taskExists(db, taskId) {
    const task = await db.query.tasks.findFirst({
        where(fields, operators) {
            return operators.eq(fields.id, taskId);
        },
    });
    return !!task;
}
export const list = (async (c) => {
    const { db } = createDb(c.env);
    const { taskId } = c.req.valid("param");
    // Check if task exists first
    const task = await db.query.tasks.findFirst({
        where(fields, operators) {
            return operators.eq(fields.id, taskId);
        },
    });
    if (!task) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    const allSubtasks = await db.query.subtasks.findMany({
        where(fields, operators) {
            return operators.eq(fields.taskId, taskId);
        },
        orderBy: (subtasks, { asc }) => [asc(subtasks.order)],
    });
    return c.json(allSubtasks, HttpStatusCodes.OK);
});
export const create = async (c) => {
    const { db } = createDb(c.env);
    const { taskId } = c.req.valid("param");
    const subtask = c.req.valid("json");
    if (!(await taskExists(db, taskId))) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    // Get current max order
    const existingSubtasks = await db.query.subtasks.findMany({
        where(fields, operators) {
            return operators.eq(fields.taskId, taskId);
        },
        orderBy: (subtasks, { desc }) => [desc(subtasks.order)],
        limit: 1,
    });
    const newOrder = existingSubtasks.length > 0 ? existingSubtasks[0].order + 1 : 0;
    const [inserted] = await db.insert(subtasks).values({
        ...subtask,
        taskId,
        order: subtask.order ?? newOrder,
    }).returning();
    return c.json(inserted, HttpStatusCodes.CREATED);
};
export const getOne = async (c) => {
    const { db } = createDb(c.env);
    const { taskId, id } = c.req.valid("param");
    const subtask = await db.query.subtasks.findFirst({
        where(fields, operators) {
            return operators.and(operators.eq(fields.taskId, taskId), operators.eq(fields.id, id));
        },
    });
    if (!subtask) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(subtask, HttpStatusCodes.OK);
};
export const patch = async (c) => {
    const { db } = createDb(c.env);
    const { taskId, id } = c.req.valid("param");
    const updates = c.req.valid("json");
    if (Object.keys(updates).length === 0) {
        return c.json({
            success: false,
            error: {
                issues: [
                    {
                        code: ZOD_ERROR_CODES.INVALID_UPDATES,
                        path: [],
                        message: ZOD_ERROR_MESSAGES.NO_UPDATES,
                    },
                ],
                name: "ZodError",
            },
        }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }
    const [subtask] = await db.update(subtasks)
        .set(updates)
        .where(and(eq(subtasks.taskId, taskId), eq(subtasks.id, id)))
        .returning();
    if (!subtask) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(subtask, HttpStatusCodes.OK);
};
export const remove = async (c) => {
    const { db } = createDb(c.env);
    const { taskId, id } = c.req.valid("param");
    const result = await db.delete(subtasks)
        .where(and(eq(subtasks.taskId, taskId), eq(subtasks.id, id)));
    if (result.rowsAffected === 0) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.body(null, HttpStatusCodes.NO_CONTENT);
};
export const toggle = async (c) => {
    const { db } = createDb(c.env);
    const { taskId, id } = c.req.valid("param");
    // Get current subtask
    const current = await db.query.subtasks.findFirst({
        where(fields, operators) {
            return operators.and(operators.eq(fields.taskId, taskId), operators.eq(fields.id, id));
        },
    });
    if (!current) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    const [subtask] = await db.update(subtasks)
        .set({ done: !current.done })
        .where(and(eq(subtasks.taskId, taskId), eq(subtasks.id, id)))
        .returning();
    return c.json(subtask, HttpStatusCodes.OK);
};
export const reorder = async (c) => {
    const { db } = createDb(c.env);
    const { taskId } = c.req.valid("param");
    const { subtaskIds } = c.req.valid("json");
    if (!(await taskExists(db, taskId))) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    // Update order for each subtask
    for (let i = 0; i < subtaskIds.length; i++) {
        await db.update(subtasks)
            .set({ order: i })
            .where(and(eq(subtasks.taskId, taskId), eq(subtasks.id, subtaskIds[i])));
    }
    // Return updated subtasks
    const updatedSubtasks = await db.query.subtasks.findMany({
        where(fields, operators) {
            return operators.eq(fields.taskId, taskId);
        },
        orderBy: (subtasks, { asc }) => [asc(subtasks.order)],
    });
    return c.json(updatedSubtasks, HttpStatusCodes.OK);
};
