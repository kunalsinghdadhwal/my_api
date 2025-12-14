import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "../../db/index.js";
import { categories } from "../../db/schema.js";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../lib/constants.js";
export const list = async (c) => {
    const { db } = createDb(c.env);
    const allCategories = await db.query.categories.findMany({
        orderBy: (categories, { desc }) => [desc(categories.createdAt)],
    });
    return c.json(allCategories);
};
export const create = async (c) => {
    const { db } = createDb(c.env);
    const category = c.req.valid("json");
    const [inserted] = await db.insert(categories).values(category).returning();
    return c.json(inserted, HttpStatusCodes.CREATED);
};
export const getOne = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const category = await db.query.categories.findFirst({
        where(fields, operators) {
            return operators.eq(fields.id, id);
        },
    });
    if (!category) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(category, HttpStatusCodes.OK);
};
export const patch = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
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
    const [category] = await db.update(categories)
        .set(updates)
        .where(eq(categories.id, id))
        .returning();
    if (!category) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(category, HttpStatusCodes.OK);
};
export const remove = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const result = await db.delete(categories)
        .where(eq(categories.id, id));
    if (result.rowsAffected === 0) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.body(null, HttpStatusCodes.NO_CONTENT);
};
