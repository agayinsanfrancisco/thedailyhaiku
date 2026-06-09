import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").default("#6366f1"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: integer("month").notNull(),
  day: integer("day").notNull(),
  year: integer("year"),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  source: text("source"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
});

export const haikus = sqliteTable("haikus", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  year: integer("year").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2").notNull(),
  line3: text("line3").notNull(),
  title: text("title"),
  categoryId: integer("category_id").references(() => categories.id),
  eventId: integer("event_id").references(() => events.id),
  customEventTitle: text("custom_event_title"),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Haiku = typeof haikus.$inferSelect;
export type NewHaiku = typeof haikus.$inferInsert;
