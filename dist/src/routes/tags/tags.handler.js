import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "../../db/index.js";
import { tags } from "../../db/schema.js";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../lib/constants.js";
export const list = async (c) => {
    const { db } = createDb(c.env);
    const allTags = await db.query.tags.findMany({
        orderBy: (tags, { asc }) => [asc(tags.name)],
    });
    return c.json(allTags);
};
export const create = async (c) => {
    const { db } = createDb(c.env);
    const tag = c.req.valid("json");
    // Check if tag with same name exists
    const existing = await db.query.tags.findFirst({
        where(fields, operators) {
            return operators.eq(fields.name, tag.name);
        },
    });
    if (existing) {
        return c.json({ message: "Tag with this name already exists" }, HttpStatusCodes.CONFLICT);
    }
    const [inserted] = await db.insert(tags).values(tag).returning();
    return c.json(inserted, HttpStatusCodes.CREATED);
};
export const getOne = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const tag = await db.query.tags.findFirst({
        where(fields, operators) {
            return operators.eq(fields.id, id);
        },
    });
    if (!tag) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(tag, HttpStatusCodes.OK);
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
    const [tag] = await db.update(tags)
        .set(updates)
        .where(eq(tags.id, id))
        .returning();
    if (!tag) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json(tag, HttpStatusCodes.OK);
};
export const remove = async (c) => {
    const { db } = createDb(c.env);
    const { id } = c.req.valid("param");
    const result = await db.delete(tags)
        .where(eq(tags.id, id));
    if (result.rowsAffected === 0) {
        return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }
    return c.body(null, HttpStatusCodes.NO_CONTENT);
};
