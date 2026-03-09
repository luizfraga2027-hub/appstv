CREATE TABLE `accessLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`macId` varchar(255) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`applicationId` int NOT NULL,
	`status` enum('success','failed','blocked') NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accessLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(64) NOT NULL,
	`version` varchar(32) NOT NULL,
	`description` text,
	`status` enum('active','inactive','deprecated') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `applications_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `macActivations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resellerId` int NOT NULL,
	`customerId` int,
	`applicationId` int NOT NULL,
	`macId` varchar(255) NOT NULL,
	`iptvListUrl` text,
	`dns1` varchar(255),
	`dns2` varchar(255),
	`dns3` varchar(255),
	`status` enum('active','expired','blocked') NOT NULL DEFAULT 'active',
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`expirationDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `macActivations_id` PRIMARY KEY(`id`),
	CONSTRAINT `macActivations_macId_unique` UNIQUE(`macId`)
);
