CREATE TABLE `discord_servers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`serverName` text,
	`ownerId` varchar(64),
	`botToken` text,
	`prefix` varchar(10) DEFAULT '!',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discord_servers_id` PRIMARY KEY(`id`),
	CONSTRAINT `discord_servers_serverId_unique` UNIQUE(`serverId`)
);
--> statement-breakpoint
CREATE TABLE `feature_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`featureName` varchar(100) NOT NULL,
	`isEnabled` boolean DEFAULT true,
	`settings` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`channelId` varchar(64) NOT NULL,
	`content` text,
	`action` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(50) NOT NULL,
	`reason` text,
	`moderatorId` varchar(64),
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`amount` bigint NOT NULL,
	`type` varchar(50) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_balance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`balance` bigint DEFAULT 0,
	`xp` bigint DEFAULT 0,
	`level` int DEFAULT 1,
	`reputation` int DEFAULT 0,
	`lastDailyReward` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_balance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`roleId` varchar(64) NOT NULL,
	`roleName` text,
	`isTemporary` boolean DEFAULT false,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_warnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`warnCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_warnings_id` PRIMARY KEY(`id`)
);
