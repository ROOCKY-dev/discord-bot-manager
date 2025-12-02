import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Discord Bot Configuration & Settings
 */
export const discordServers = mysqlTable("discord_servers", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull().unique(),
  serverName: text("serverName"),
  ownerId: varchar("ownerId", { length: 64 }),
  botToken: text("botToken"),
  prefix: varchar("prefix", { length: 10 }).default("!"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiscordServer = typeof discordServers.$inferSelect;
export type InsertDiscordServer = typeof discordServers.$inferInsert;

/**
 * Moderation Logs
 */
export const moderationLogs = mysqlTable("moderation_logs", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // ban, kick, mute, warn, etc
  reason: text("reason"),
  moderatorId: varchar("moderatorId", { length: 64 }),
  duration: int("duration"), // in seconds, null for permanent
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = typeof moderationLogs.$inferInsert;

/**
 * User Warnings
 */
export const userWarnings = mysqlTable("user_warnings", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  warnCount: int("warnCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserWarning = typeof userWarnings.$inferSelect;
export type InsertUserWarning = typeof userWarnings.$inferInsert;

/**
 * User Roles & Permissions
 */
export const userRoles = mysqlTable("user_roles", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  roleId: varchar("roleId", { length: 64 }).notNull(),
  roleName: text("roleName"),
  isTemporary: boolean("isTemporary").default(false),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

/**
 * Economy System - User Balance
 */
export const userBalance = mysqlTable("user_balance", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  balance: bigint("balance", { mode: "number" }).default(0),
  xp: bigint("xp", { mode: "number" }).default(0),
  level: int("level").default(1),
  reputation: int("reputation").default(0),
  lastDailyReward: timestamp("lastDailyReward"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserBalance = typeof userBalance.$inferSelect;
export type InsertUserBalance = typeof userBalance.$inferInsert;

/**
 * Economy Transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Message Logs
 */
export const messageLogs = mysqlTable("message_logs", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull(),
  messageId: varchar("messageId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  channelId: varchar("channelId", { length: 64 }).notNull(),
  content: text("content"),
  action: varchar("action", { length: 50 }).notNull(), // deleted, edited, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageLog = typeof messageLogs.$inferSelect;
export type InsertMessageLog = typeof messageLogs.$inferInsert;

/**
 * Feature Settings per Server
 */
export const featureSettings = mysqlTable("feature_settings", {
  id: int("id").autoincrement().primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull(),
  featureName: varchar("featureName", { length: 100 }).notNull(),
  isEnabled: boolean("isEnabled").default(true),
  settings: text("settings"), // JSON string for feature-specific settings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureSetting = typeof featureSettings.$inferSelect;
export type InsertFeatureSetting = typeof featureSettings.$inferInsert;