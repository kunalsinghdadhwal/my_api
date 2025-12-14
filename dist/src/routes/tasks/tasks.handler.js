import { and, asc, count, desc, eq, inArray, like, lt, or, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "../../db/index.js";
import { subtasks, tasks, taskTags } from "../../db/schema.js";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../lib/constants.js";
// Helper function to get task with all relations
async function getTaskWithRelations(db, taskId) {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
        with: {
            category: true,
            subtasks: {
                orderBy: [asc(subtasks.order)],
            },
            taskTags: {
                with: {
                    tag: true,
                },
            },
        },
    });
    if (!task)
        return null;
    // Transform taskTags to tags array
    return {
        ...task,
        tags: task.taskTags?.map(tt => tt.tag) || [],
        taskTags: undefined,
    };
}
// Priority sort order mapping
const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
export const list = async (c) => {
    const { db } = createDb(c.env);
    const query = c.req.valid("query");
    const { done, priority, categoryId, search, sortBy, sortOrder, page, limit, overdue, tagId } = query;
    // Build where conditions
    const conditions = [];
    if (done !== undefined) {
        conditions.push(eq(tasks.done, done === "true"));
    }
    if (priority) {
        conditions.push(eq(tasks.priority, priority));
    }
    if (categoryId) {
        conditions.push(eq(tasks.categoryId, categoryId));
    }
    if (search) {
        conditions.push(or(like(tasks.name, `%${search}%`), like(tasks.description, `%${search}%`)));
    }
    if (overdue === "true") {
        conditions.push(and(eq(tasks.done, false), lt(tasks.dueDate, new Date())));
    }
    // Handle tag filtering - need subquery
    let taskIdsWithTag;
    if (tagId) {
        const tasksWithTag = await db.select({ taskId: taskTags.taskId })
            .from(taskTags)
            .where(eq(taskTags.tagId, tagId));
        taskIdsWithTag = tasksWithTag.map(t => t.taskId);
        if (taskIdsWithTag.length > 0) {
            conditions.push(inArray(tasks.id, taskIdsWithTag));
        }
        else {
            // No tasks have this tag, return empty
            return c.json({
                data: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
            });
        }
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    // Get total count
    const [{ total }] = await db.select({ total: count() })
        .from(tasks)
        .where(whereClause);
    // Build order by
    let orderByClause;
    const orderFn = sortOrder === "asc" ? asc : desc;
    switch (sortBy) {
        case "name":
            orderByClause = orderFn(tasks.name);
            break;
        case "dueDate":
            orderByClause = orderFn(tasks.dueDate);
            break;
        case "priority":
            // Custom priority ordering
            orderByClause = sortOrder === "asc"
                ? desc(sql `CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`)
                : asc(sql `CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`);
            break;
        case "updatedAt":
            orderByClause = orderFn(tasks.updatedAt);
            break;
        case "createdAt":
        default:
            orderByClause = orderFn(tasks.createdAt);
            break;
    }
    // Fetch tasks with relations
    const offset = (page - 1) * limit;
    const allTasks = await db.query.tasks.findMany({
        where: whereClause,
        with: {
            category: true,
            subtasks: {
                orderBy: [asc(subtasks.order)],
            },
            taskTags: {
                with: {
                    tag: true,
                },
            },
        },
        orderBy: orderByClause,
        limit,
        offset,
    });
    // Transform tasks to include tags array
    const transformedTasks = allTasks.map(task => ({
        ...task,
        tags: task.taskTags?.map(tt => tt.tag) || [],
        taskTags: undefined,
    }));
    return c.json({
        data: transformedTasks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};
export const create = async (c) => {
    const { db } = createDb(c.env);
    const { tagIds, ...taskData } = c.req.valid("json");
    const [inserted] = await db.insert(tasks).values(taskData).returning();
    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
        await db.insert(taskTags).values(tagIds.map(tagId => ({ taskId: inserted.id, tagId })));
    }
    const taskWithRelations = await getTaskWithRelations(db, inserted.id);
    return c.json(taskWithRelations, HttpStatusCodes.CREATED);
};
export const getOne = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const task = await getTaskWithRelations(db, id);
    if (!task) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(task, HttpStatusCodes.OK);
};
export const patch = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const { tagIds, ...updates } = c.req.valid("json");
    if (Object.keys(updates).length === 0 && tagIds === undefined) {
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
    // Check if updating 'done' status
    if (updates.done !== undefined) {
        updates.completedAt = updates.done ? new Date() : null;
    }
    if (Object.keys(updates).length > 0) {
        const [task] = await db.update(tasks)
            .set(updates)
            .where(eq(tasks.id, id))
            .returning();
        if (!task) {
            return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
        }
    }
    // Update tags if provided
    if (tagIds !== undefined) {
        // Remove existing tags
        await db.delete(taskTags).where(eq(taskTags.taskId, id));
        // Add new tags
        if (tagIds.length > 0) {
            await db.insert(taskTags).values(tagIds.map(tagId => ({ taskId: id, tagId })));
        }
    }
    const taskWithRelations = await getTaskWithRelations(db, id);
    if (!taskWithRelations) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(taskWithRelations, HttpStatusCodes.OK);
};
export const remove = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const result = await db.delete(tasks)
        .where(eq(tasks.id, id));
    if (result.rowsAffected === 0) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.body(null, HttpStatusCodes.NO_CONTENT);
};
export const toggle = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    // Get current task
    const current = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
    });
    if (!current) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    const newDoneStatus = !current.done;
    await db.update(tasks)
        .set({
        done: newDoneStatus,
        completedAt: newDoneStatus ? new Date() : null,
    })
        .where(eq(tasks.id, id));
    const taskWithRelations = await getTaskWithRelations(db, id);
    return c.json(taskWithRelations, HttpStatusCodes.OK);
};
export const bulkUpdate = async (c) => {
    const { db } = createDb(c.env);
    const { ids, done, priority, categoryId } = c.req.valid("json");
    const updates = {};
    if (done !== undefined) {
        updates.done = done;
        updates.completedAt = done ? new Date() : null;
    }
    if (priority !== undefined)
        updates.priority = priority;
    if (categoryId !== undefined)
        updates.categoryId = categoryId;
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
    const updatedTasks = await db.update(tasks)
        .set(updates)
        .where(inArray(tasks.id, ids))
        .returning();
    return c.json({
        updated: updatedTasks.length,
        tasks: updatedTasks,
    }, HttpStatusCodes.OK);
};
export const bulkDelete = async (c) => {
    const { db } = createDb(c.env);
    const { ids } = c.req.valid("json");
    const result = await db.delete(tasks)
        .where(inArray(tasks.id, ids));
    return c.json({ deleted: result.rowsAffected }, HttpStatusCodes.OK);
};
export const addTags = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const { tagIds } = c.req.valid("json");
    // Check if task exists
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
    });
    if (!task) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    // Get existing tags for this task
    const existingTags = await db.select({ tagId: taskTags.tagId })
        .from(taskTags)
        .where(eq(taskTags.taskId, id));
    const existingTagIds = new Set(existingTags.map(t => t.tagId));
    // Only add tags that don't already exist
    const newTagIds = tagIds.filter(tagId => !existingTagIds.has(tagId));
    if (newTagIds.length > 0) {
        await db.insert(taskTags).values(newTagIds.map(tagId => ({ taskId: id, tagId })));
    }
    const taskWithRelations = await getTaskWithRelations(db, id);
    return c.json(taskWithRelations, HttpStatusCodes.OK);
};
export const removeTags = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const { tagIds } = c.req.valid("json");
    // Check if task exists
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
    });
    if (!task) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    await db.delete(taskTags)
        .where(and(eq(taskTags.taskId, id), inArray(taskTags.tagId, tagIds)));
    const taskWithRelations = await getTaskWithRelations(db, id);
    return c.json(taskWithRelations, HttpStatusCodes.OK);
};
