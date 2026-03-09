CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`resellerId` int NOT NULL,
	`iptvListUrl` text,
	`status` enum('active','inactive','blocked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `resellers` ADD `iptvListUrl` text;--> statement-breakpoint
ALTER TABLE `resellers` ADD `codePrice` decimal(10,2) DEFAULT '0' NOT NULL;