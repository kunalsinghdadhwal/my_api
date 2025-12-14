import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { createDb } from "../../db/index.js";
import { categories, subtasks, tasks } from "../../db/schema.js";
export const dashboard = async (c) => {
    const { db } = createDb(c.env);
    const now = new Date();
    // Get total tasks count
    const [totalResult] = await db.select({ count: count() }).from(tasks);
    const total = totalResult.count;
    // Get completed tasks count
    const [completedResult] = await db.select({ count: count() })
        .from(tasks)
        .where(eq(tasks.done, true));
    const completed = completedResult.count;
    // Get overdue tasks count (not done and past due date)
    const [overdueResult] = await db.select({ count: count() })
        .from(tasks)
        .where(and(eq(tasks.done, false), lt(tasks.dueDate, now)));
    const overdue = overdueResult.count;
    // Get tasks by priority
    const priorityCounts = await db.select({
        priority: tasks.priority,
        count: count(),
    })
        .from(tasks)
        .where(eq(tasks.done, false))
        .groupBy(tasks.priority);
    const byPriority = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
    };
    for (const row of priorityCounts) {
        if (row.priority in byPriority) {
            byPriority[row.priority] = row.count;
        }
    }
    // Get tasks by category
    const categoryCounts = await db.select({
        categoryId: tasks.categoryId,
        categoryName: categories.name,
        count: count(),
    })
        .from(tasks)
        .leftJoin(categories, eq(tasks.categoryId, categories.id))
        .groupBy(tasks.categoryId, categories.name);
    const byCategory = categoryCounts.map(row => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        count: row.count,
    }));
    // Get recently completed tasks
    const recentlyCompleted = await db.select({
        id: tasks.id,
        name: tasks.name,
        completedAt: tasks.completedAt,
    })
        .from(tasks)
        .where(eq(tasks.done, true))
        .orderBy(desc(tasks.completedAt))
        .limit(5);
    // Get upcoming due tasks (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDue = await db.select({
        id: tasks.id,
        name: tasks.name,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
    })
        .from(tasks)
        .where(and(eq(tasks.done, false), gte(tasks.dueDate, now), lt(tasks.dueDate, nextWeek)))
        .orderBy(tasks.dueDate)
        .limit(10);
    // Get subtask progress
    const [subtaskTotal] = await db.select({ count: count() }).from(subtasks);
    const [subtaskCompleted] = await db.select({ count: count() })
        .from(subtasks)
        .where(eq(subtasks.done, true));
    return c.json({
        tasks: {
            total,
            completed,
            pending: total - completed,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
        byPriority,
        byCategory,
        recentlyCompleted,
        upcomingDue,
        subtaskProgress: {
            total: subtaskTotal.count,
            completed: subtaskCompleted.count,
        },
    }, HttpStatusCodes.OK);
};
export const productivity = async (c) => {
    const { db } = createDb(c.env);
    const { days } = c.req.valid("query");
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    // Get daily created/completed counts
    // Using SQLite date functions
    const dailyStats = await db.select({
        date: sql `date(${tasks.createdAt} / 1000, 'unixepoch')`.as("date"),
        created: count(),
    })
        .from(tasks)
        .where(gte(tasks.createdAt, startDate))
        .groupBy(sql `date(${tasks.createdAt} / 1000, 'unixepoch')`);
    const dailyCompleted = await db.select({
        date: sql `date(${tasks.completedAt} / 1000, 'unixepoch')`.as("date"),
        completed: count(),
    })
        .from(tasks)
        .where(and(eq(tasks.done, true), gte(tasks.completedAt, startDate)))
        .groupBy(sql `date(${tasks.completedAt} / 1000, 'unixepoch')`);
    // Merge created and completed stats by date
    const statsMap = new Map();
    for (const row of dailyStats) {
        if (row.date) {
            statsMap.set(row.date, { created: row.created, completed: 0 });
        }
    }
    for (const row of dailyCompleted) {
        if (row.date) {
            const existing = statsMap.get(row.date) || { created: 0, completed: 0 };
            statsMap.set(row.date, { ...existing, completed: row.completed });
        }
    }
    // Convert to array and sort by date
    const daily = Array.from(statsMap.entries())
        .map(([date, stats]) => ({
        date,
        created: stats.created,
        completed: stats.completed,
    }))
        .sort((a, b) => a.date.localeCompare(b.date));
    // Calculate totals
    const totalCreatedThisWeek = daily.reduce((sum, d) => sum + d.created, 0);
    const totalCompletedThisWeek = daily.reduce((sum, d) => sum + d.completed, 0);
    return c.json({
        daily,
        totalCreatedThisWeek,
        totalCompletedThisWeek,
    }, HttpStatusCodes.OK);
};
