-- Adminer 4.8.1 MySQL 8.3.0 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `checklists`;
CREATE TABLE `checklists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `checklists` (`id`, `user_id`, `name`, `created_at`) VALUES
(6,	1,	'Laporan produksi harian',	'2025-01-08 09:39:00');

DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `checklist_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('pending','completed','cancel') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `checklist_id` (`checklist_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `items` (`id`, `checklist_id`, `name`, `status`, `created_at`) VALUES
(4,	6,	'Pembuatan hpp',	'pending',	'2025-01-08 09:39:38');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3;

INSERT INTO `users` (`id`, `device_id`, `email`, `password`, `first_name`, `last_name`) VALUES
(1,	'test',	'wadnasssd@gmail.com',	'$2a$10$tqu5TVVyPhlmBDw8L6JnX.vey/izSdT0roKMoPL6avUzl2THd2tSy',	'wanda',	'tse');

-- 2025-01-08 09:47:30
