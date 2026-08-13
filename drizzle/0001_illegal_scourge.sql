CREATE TABLE `findings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`severity` enum('Critical','High','Medium','Low','Info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`remediation` text NOT NULL,
	`evidence` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetUrl` varchar(2048) NOT NULL,
	`status` enum('completed','failed') NOT NULL DEFAULT 'completed',
	`criticalCount` int NOT NULL DEFAULT 0,
	`highCount` int NOT NULL DEFAULT 0,
	`mediumCount` int NOT NULL DEFAULT 0,
	`lowCount` int NOT NULL DEFAULT 0,
	`infoCount` int NOT NULL DEFAULT 0,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
