import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  language: text("language").notNull(),
  description: text("description").notNull(),
  example: text("example"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const libraries = pgTable("libraries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  stars: integer("stars").notNull(),
  forks: integer("forks").notNull(),
  topics: json("topics").$type<string[]>().default([]),
  updatedAt: timestamp("updated_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => searches.id).notNull(),
  libraryId: integer("library_id").references(() => libraries.id).notNull(),
  rank: integer("rank").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const searchesRelations = relations(searches, ({ many }) => ({
  results: many(searchResults),
}));

export const librariesRelations = relations(libraries, ({ many }) => ({
  searchResults: many(searchResults),
}));

export const searchResultsRelations = relations(searchResults, ({ one }) => ({
  search: one(searches, {
    fields: [searchResults.searchId],
    references: [searches.id],
  }),
  library: one(libraries, {
    fields: [searchResults.libraryId],
    references: [libraries.id],
  }),
}));

// Schemas
export const insertSearchSchema = createInsertSchema(searches);
export const selectSearchSchema = createSelectSchema(searches);
export const insertLibrarySchema = createInsertSchema(libraries);
export const selectLibrarySchema = createSelectSchema(libraries);
export const insertSearchResultSchema = createInsertSchema(searchResults);
export const selectSearchResultSchema = createSelectSchema(searchResults);

// Types
export type InsertSearch = typeof searches.$inferInsert;
export type SelectSearch = typeof searches.$inferSelect;
export type InsertLibrary = typeof libraries.$inferInsert;
export type SelectLibrary = typeof libraries.$inferSelect;
export type InsertSearchResult = typeof searchResults.$inferInsert;
export type SelectSearchResult = typeof searchResults.$inferSelect;