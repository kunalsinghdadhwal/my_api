import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";

const tags = ["Statistics"];

// Dashboard statistics schema
const dashboardStatsSchema = z.object({
  tasks: z.object({
    total: z.number(),
    completed: z.number(),
    pending: z.number(),
    overdue: z.number(),
    completionRate: z.number(),
  }),
  byPriority: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
    urgent: z.number(),
  }),
  byCategory: z.array(z.object({
    categoryId: z.number().nullable(),
    categoryName: z.string().nullable(),
    count: z.number(),
  })),
  recentlyCompleted: z.array(z.object({
    id: z.number(),
    name: z.string(),
    completedAt: z.date().nullable(),
  })),
  upcomingDue: z.array(z.object({
    id: z.number(),
    name: z.string(),
    dueDate: z.date().nullable(),
    priority: z.string(),
  })),
  subtaskProgress: z.object({
    total: z.number(),
    completed: z.number(),
  }),
});

export const dashboard = createRoute({
  path: "/stats/dashboard",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      dashboardStatsSchema,
      "Dashboard statistics overview",
    ),
  },
});

// Productivity stats over time
const productivityStatsSchema = z.object({
  daily: z.array(z.object({
    date: z.string(),
    created: z.number(),
    completed: z.number(),
  })),
  totalCreatedThisWeek: z.number(),
  totalCompletedThisWeek: z.number(),
});

export const productivity = createRoute({
  path: "/stats/productivity",
  method: "get",
  tags,
  request: {
    query: z.object({
      days: z.coerce.number().min(1).max(30).default(7),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      productivityStatsSchema,
      "Productivity statistics over time",
    ),
  },
});

export type DashboardRoute = typeof dashboard;
export type ProductivityRoute = typeof productivity;
