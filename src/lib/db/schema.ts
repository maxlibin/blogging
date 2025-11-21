import { integer, pgTable, varchar, timestamp, text } from 'drizzle-orm/pg-core';

// Example users table - you can modify this based on your needs
export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// Example posts table for blog posts
export const postsTable = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id),
  title: varchar({ length: 500 }).notNull(),
  content: text().notNull(),
  status: varchar({ length: 50 }).notNull().default('draft'), // draft, published
  wordpressId: integer(), // WordPress post ID if published
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
