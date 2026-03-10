CREATE TABLE `appCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`resellerId` int NOT NULL,
	`applicationId` int NOT NULL,
	`dnsCount` int NOT NULL DEFAULT 3,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `appCodes_code_unique` UNIQUE(`code`)
);
