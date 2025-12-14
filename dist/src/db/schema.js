import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
// ============================================================================
// CATEGORIES TABLE
// ============================================================================
export const categories = sqliteTable("categories", {
    id: integer("id", { mode: "number" })
        .primaryKey({ autoIncrement: true }),
    name: text("name")
        .notNull(),
    description: text("description"),
    color: text("color")
        .default("#3b82f6"), // Default blue color
    createdAt: integer("created_at", { mode: "timestamp" })
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
});
export const categoriesRelations = relations(categories, ({ many }) => ({
    tasks: many(tasks),
}));
export const selectCategoriesSchema = createSelectSchema(categories);
export const insertCategoriesSchema = createInsertSchema(categories, {
    name: schema => schema.name.min(1).max(100),
    description: schema => schema.description.max(500).optional(),
    color: schema => schema.color.regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const patchCategoriesSchema = insertCategoriesSchema.partial();
// ============================================================================
// TAGS TABLE
// ============================================================================
export const tags = sqliteTable("tags", {
    id: integer("id", { mode: "number" })
        .primaryKey({ autoIncrement: true }),
    name: text("name")
        .notNull()
        .unique(),
    color: text("color")
        .default("#6b7280"), // Default gray color
    createdAt: integer("created_at", { mode: "timestamp" })
        .$defaultFn(() => new Date()),
});
export const tagsRelations = relations(tags, ({ many }) => ({
    taskTags: many(taskTags),
}));
export const selectTagsSchema = createSelectSchema(tags);
export const insertTagsSchema = createInsertSchema(tags, {
    name: schema => schema.name.min(1).max(50),
    color: schema => schema.color.regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
}).omit({
    id: true,
    createdAt: true,
});
export const patchTagsSchema = insertTagsSchema.partial();
// ============================================================================
// TASKS TABLE (Enhanced)
// ============================================================================
export const priorityEnum = ["low", "medium", "high", "urgent"];
export const tasks = sqliteTable("tasks", {
    id: integer("id", { mode: "number" })
        .primaryKey({ autoIncrement: true }),
    name: text("name")
        .notNull(),
    description: text("description"),
    done: integer("done", { mode: "boolean" })
        .notNull()
        .default(false),
    priority: text("priority", { enum: priorityEnum })
        .notNull()
        .default("medium"),
    dueDate: integer("due_date", { mode: "timestamp" }),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    categoryId: integer("category_id")
        .references(() => categories.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" })
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
});
export const tasksRelations = relations(tasks, ({ one, many }) => ({
    category: one(categories, {
        fields: [tasks.categoryId],
        references: [categories.id],
    }),
    subtasks: many(subtasks),
    taskTags: many(taskTags),
}));
export const selectTasksSchema = createSelectSchema(tasks);
export const insertTasksSchema = createInsertSchema(tasks, {
    name: schema => schema.name.min(1).max(500),
    description: schema => schema.description.max(2000).optional(),
    priority: () => z.enum(priorityEnum).default("medium"),
    dueDate: () => z.coerce.date().optional(),
}).required({
    done: true,
}).omit({
    id: true,
    completedAt: true,
    createdAt: true,
    updatedAt: true,
});
export const patchTasksSchema = insertTasksSchema.partial();
// ============================================================================
// SUBTASKS TABLE
// ============================================================================
export const subtasks = sqliteTable("subtasks", {
    id: integer("id", { mode: "number" })
        .primaryKey({ autoIncrement: true }),
    name: text("name")
        .notNull(),
    done: integer("done", { mode: "boolean" })
        .notNull()
        .default(false),
    taskId: integer("task_id")
        .notNull()
        .references(() => tasks.id, { onDelete: "cascade" }),
    order: integer("order")
        .notNull()
        .default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
        .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date()),
});
export const subtasksRelations = relations(subtasks, ({ one }) => ({
    task: one(tasks, {
        fields: [subtasks.taskId],
        references: [tasks.id],
    }),
}));
export const selectSubtasksSchema = createSelectSchema(subtasks);
export const insertSubtasksSchema = createInsertSchema(subtasks, {
    name: schema => schema.name.min(1).max(300),
    order: schema => schema.order.min(0).optional(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const patchSubtasksSchema = insertSubtasksSchema.partial().omit({ taskId: true });
// ============================================================================
// TASK_TAGS JUNCTION TABLE (Many-to-Many)
// ============================================================================
export const taskTags = sqliteTable("task_tags", {
    id: integer("id", { mode: "number" })
        .primaryKey({ autoIncrement: true }),
    taskId: integer("task_id")
        .notNull()
        .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
        .notNull()
        .references(() => tags.id, { onDelete: "cascade" }),
});
export const taskTagsRelations = relations(taskTags, ({ one }) => ({
    task: one(tasks, {
        fields: [taskTags.taskId],
        references: [tasks.id],
    }),
    tag: one(tags, {
        fields: [taskTags.tagId],
        references: [tags.id],
    }),
}));
// ============================================================================
// QUERY SCHEMAS
// ============================================================================
export const taskQuerySchema = z.object({
    done: z.enum(["true", "false"]).optional(),
    priority: z.enum(priorityEnum).optional(),
    categoryId: z.coerce.number().optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority", "name"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    overdue: z.enum(["true", "false"]).optional(),
    tagId: z.coerce.number().optional(),
});
export const bulkIdsSchema = z.object({
    ids: z.array(z.number()).min(1).max(100),
});
export const bulkUpdateSchema = z.object({
    ids: z.array(z.number()).min(1).max(100),
    done: z.boolean().optional(),
    priority: z.enum(priorityEnum).optional(),
    categoryId: z.number().nullable().optional(),
});
