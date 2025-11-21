import { integer, pgTable, varchar, timestamp, text, jsonb } from 'drizzle-orm/pg-core';

// Users table with Clerk integration
export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Posts table for blog posts with research data
export const postsTable = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id),
  title: varchar({ length: 500 }).notNull(),
  content: text().notNull(),
  status: varchar({ length: 50 }).notNull().default('draft'), // researching, draft, published
  
  // Research data
  researchSummary: text(),
  trendAnalysis: jsonb(), // { sentiment, key_events, sources_news, sources_social, suggested_topics }
  
  // Media
  featuredImageUrl: text(), // Base64 data URI or external URL
  
  // WordPress integration
  wordpressId: integer(),
  wordpressLink: varchar({ length: 500 }),
  
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Sources table for research sources
export const sourcesTable = pgTable('sources', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  postId: integer().notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  title: varchar({ length: 500 }).notNull(),
  uri: varchar({ length: 1000 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});
