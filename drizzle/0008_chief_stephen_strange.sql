ALTER TABLE `plans` MODIFY COLUMN `type` enum('reseller_monthly','reseller_credit','customer') NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `logoUrl` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `applicationId` int;--> statement-breakpoint
ALTER TABLE `customers` ADD `customerUsername` varchar(255);--> statement-breakpoint
ALTER TABLE `customers` ADD `customerPassword` varchar(255);--> statement-breakpoint
ALTER TABLE `customers` ADD `activationDate` timestamp;--> statement-breakpoint
ALTER TABLE `resellers` ADD `type` enum('monthly','credit') DEFAULT 'credit' NOT NULL;--> statement-breakpoint
ALTER TABLE `resellers` ADD `planId` int;--> statement-breakpoint
ALTER TABLE `resellers` ADD `pixKey` varchar(255);--> statement-breakpoint
ALTER TABLE `resellers` ADD `activationDate` timestamp;--> statement-breakpoint
ALTER TABLE `resellers` ADD `expirationDate` timestamp;--> statement-breakpoint
ALTER TABLE `resellers` ADD `maxDns` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `resellers` ADD `allowedApps` text;