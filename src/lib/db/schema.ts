import { pgTable, serial, integer, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").default("#6366f1"),
  createdAt: timestamp("created_at", { mode: "string" }).default(sql`now()`),
});

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    month: integer("month").notNull(),
    day: integer("day").notNull(),
    year: integer("year"),
    title: text("title").notNull(),
    description: text("description"),
    categoryId: integer("category_id").references(() => categories.id),
    source: text("source"),
    createdAt: timestamp("created_at", { mode: "string" }).default(sql`now()`),
  },
  (table) => [uniqueIndex("events_month_day_title_unique").on(table.month, table.day, table.title)],
);

export const haikus = pgTable("haikus", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  year: integer("year").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2").notNull(),
  line3: text("line3").notNull(),
  title: text("title"),
  categoryId: integer("category_id").references(() => categories.id),
  eventId: integer("event_id").references(() => events.id),
  isFiller: text("is_filler").default("false"),
  validationLink: text("validation_link"),
  eventHeadline: text("event_headline"),
  eventDescription: text("event_description"),
  eventSources: text("event_sources"),
  seasonWord: text("season_word"),
  seasonColor: text("season_color"),
  manageTokenHash: text("manage_token_hash"),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { mode: "string" }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { mode: "string" }).default(sql`now()`),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  dailyWord: boolean("daily_word").default(true),
  unsubscribedAt: text("unsubscribed_at"),
  createdAt: timestamp("created_at", { mode: "string" }).default(sql`now()`),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Haiku = typeof haikus.$inferSelect;
export type NewHaiku = typeof haikus.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
