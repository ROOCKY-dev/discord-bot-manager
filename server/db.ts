import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  discordServers,
  featureSettings,
  InsertDiscordServer,
  InsertModerationLog,
  InsertMessageLog,
  messageLogs,
  moderationLogs,
  transactions,
  userBalance,
  userRoles,
  userWarnings,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Discord Server Management
 */
export async function getOrCreateServer(serverId: string, serverName?: string) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(discordServers).where(eq(discordServers.serverId, serverId)).limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(discordServers).values({ serverId, serverName });
  return db.select().from(discordServers).where(eq(discordServers.serverId, serverId)).limit(1).then(r => r[0]);
}

/**
 * Moderation Logs
 */
export async function logModeration(log: InsertModerationLog) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(moderationLogs).values(log);
}

export async function getModerationLogs(serverId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(moderationLogs).where(eq(moderationLogs.serverId, serverId)).orderBy(desc(moderationLogs.createdAt)).limit(limit);
}

/**
 * User Warnings
 */
export async function getUserWarnings(serverId: string, userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userWarnings).where(and(eq(userWarnings.serverId, serverId), eq(userWarnings.userId, userId))).limit(1);
  return result[0];
}

export async function incrementWarning(serverId: string, userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getUserWarnings(serverId, userId);
  if (existing) {
    await db.update(userWarnings).set({ warnCount: (existing.warnCount ?? 0) + 1 }).where(and(eq(userWarnings.serverId, serverId), eq(userWarnings.userId, userId)));
  } else {
    await db.insert(userWarnings).values({ serverId, userId, warnCount: 1 });
  }
}

/**
 * User Balance & Economy
 */
export async function getUserBalance(serverId: string, userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userBalance).where(and(eq(userBalance.serverId, serverId), eq(userBalance.userId, userId))).limit(1);
  if (!result[0]) {
    await db.insert(userBalance).values({ serverId, userId, balance: 0, xp: 0, level: 1 });
    return db.select().from(userBalance).where(and(eq(userBalance.serverId, serverId), eq(userBalance.userId, userId))).limit(1).then(r => r[0]);
  }
  return result[0];
}

export async function addBalance(serverId: string, userId: string, amount: number, type: string, description?: string) {
  const db = await getDb();
  if (!db) return undefined;
  const user = await getUserBalance(serverId, userId);
  if (!user) return undefined;
  const newBalance = Math.max(0, (user.balance ?? 0) + amount);
  await db.update(userBalance).set({ balance: newBalance }).where(and(eq(userBalance.serverId, serverId), eq(userBalance.userId, userId)));
  await db.insert(transactions).values({ serverId, userId, amount, type, description });
  return newBalance;
}

export async function addXP(serverId: string, userId: string, xpAmount: number) {
  const db = await getDb();
  if (!db) return undefined;
  const user = await getUserBalance(serverId, userId);
  if (!user) return undefined;
  const newXP = (user.xp ?? 0) + xpAmount;
  const newLevel = Math.floor(newXP / 1000) + 1;
  await db.update(userBalance).set({ xp: newXP, level: newLevel }).where(and(eq(userBalance.serverId, serverId), eq(userBalance.userId, userId)));
}

export async function getLeaderboard(serverId: string, type: 'balance' | 'xp' | 'reputation', limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const orderByField = type === 'balance' ? userBalance.balance : type === 'xp' ? userBalance.xp : userBalance.reputation;
  return db.select().from(userBalance).where(eq(userBalance.serverId, serverId)).orderBy(desc(orderByField)).limit(limit);
}

/**
 * User Roles
 */
export async function getUserRoles(serverId: string, userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userRoles).where(and(eq(userRoles.serverId, serverId), eq(userRoles.userId, userId)));
}

export async function addRole(serverId: string, userId: string, roleId: string, roleName?: string, isTemporary = false, expiresAt?: Date) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(userRoles).values({ serverId, userId, roleId, roleName, isTemporary, expiresAt });
}

export async function removeRole(serverId: string, userId: string, roleId: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(userRoles).where(and(and(eq(userRoles.serverId, serverId), eq(userRoles.userId, userId)), eq(userRoles.roleId, roleId)));
}

/**
 * Feature Settings
 */
export async function getFeatureSettings(serverId: string, featureName: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(featureSettings).where(and(eq(featureSettings.serverId, serverId), eq(featureSettings.featureName, featureName))).limit(1);
  return result[0];
}

export async function setFeatureSettings(serverId: string, featureName: string, isEnabled: boolean, settings?: string) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getFeatureSettings(serverId, featureName);
  if (existing) {
    await db.update(featureSettings).set({ isEnabled, settings }).where(and(eq(featureSettings.serverId, serverId), eq(featureSettings.featureName, featureName)));
  } else {
    await db.insert(featureSettings).values({ serverId, featureName, isEnabled, settings });
  }
}

/**
 * Message Logs
 */
export async function logMessage(log: InsertMessageLog) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(messageLogs).values(log);
}

export async function getMessageLogs(serverId: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messageLogs).where(eq(messageLogs.serverId, serverId)).orderBy(desc(messageLogs.createdAt)).limit(limit);
}


