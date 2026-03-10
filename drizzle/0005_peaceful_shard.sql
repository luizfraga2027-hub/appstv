CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('credit','monthly') NOT NULL,
	`maxApplications` int NOT NULL DEFAULT 999,
	`maxDns` int NOT NULL DEFAULT 3,
	`maxConnections` int NOT NULL DEFAULT 999,
	`price` decimal(10,2) NOT NULL DEFAULT '0',
	`description` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resellerPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resellerId` int NOT NULL,
	`planId` int NOT NULL,
	`activationCode` varchar(64) NOT NULL,
	`dns1` varchar(255),
	`dns2` varchar(255),
	`dns3` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resellerPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `resellerPlans_activationCode_unique` UNIQUE(`activationCode`)
);
