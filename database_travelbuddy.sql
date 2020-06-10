-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2020 at 07:58 AM
-- Server version: 10.1.36-MariaDB
-- PHP Version: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `database_travelbuddy`
--

-- --------------------------------------------------------

--
-- Table structure for table `itenerary`
--

CREATE TABLE `itenerary` (
  `iteneraryID` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `userID` varchar(36) NOT NULL,
  `rank` int(11) NOT NULL DEFAULT '0',
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `itenerary`
--

INSERT INTO `itenerary` (`iteneraryID`, `name`, `description`, `userID`, `rank`, `time`) VALUES
('07954856-2654-4a12-8642-352cb58f5f5b', 'another itenerayre', 'desc', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-06-01 17:08:26'),
('0d9fd91c-cbc5-42ed-9ec3-60085a5e7a94', 'itenerary test', '', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 1, '2020-05-31 01:35:26'),
('41c90b0d-19fc-4949-85b3-20caed5f8adf', 'itenerary 1', 'desc', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', -1, '2020-05-17 17:53:26'),
('51573297-bf82-4876-80ec-634b973d9fe1', 'it', '', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-06-01 17:15:55'),
('60cd8534-d4ca-405f-b024-e1ed32aa18a6', 'tets', 'aaa', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 1, '2020-06-01 01:42:59'),
('6dc9a5de-0cf9-44c4-8de5-3caafb690065', 'Itenerary', 'description', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', -1, '2020-05-20 19:05:37'),
('793f87f9-b582-4408-b256-5317f5f40ab4', 'multi photo itenerary', '', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-06-01 17:14:48'),
('902a10fb-622d-4f2a-91e2-85e02a665319', 'itenerary testing datra', 'desc', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-06-01 16:26:47'),
('b2e1076d-f1b9-4b7e-a94a-ec3768fa1283', 'itenerarytesting', '', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', -1, '2020-05-23 22:22:06');

-- --------------------------------------------------------

--
-- Table structure for table `iteneraryphotos`
--

CREATE TABLE `iteneraryphotos` (
  `imageID` varchar(36) NOT NULL,
  `iteneraryID` varchar(36) NOT NULL,
  `userID` varchar(36) NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `iteneraryphotos`
--

INSERT INTO `iteneraryphotos` (`imageID`, `iteneraryID`, `userID`, `time`) VALUES
('083dd179-c16f-489b-a519-4bf71c02a34c', '60cd8534-d4ca-405f-b024-e1ed32aa18a6', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-06-01 17:26:48'),
('1f4b09c3-9107-4af1-9131-a5fb1a6f5e37', '60cd8534-d4ca-405f-b024-e1ed32aa18a6', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-06-01 17:26:48'),
('272ea12f-f28b-410b-82e6-e87d1ddebee2', 'b2e1076d-f1b9-4b7e-a94a-ec3768fa1283', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-25 18:13:43'),
('463c18f6-ef29-49ce-83cb-eb9b1a9c3137', '6dc9a5de-0cf9-44c4-8de5-3caafb690065', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-20 19:05:38'),
('887f016e-a415-4fce-a7c9-34b9ba4940cb', '07954856-2654-4a12-8642-352cb58f5f5b', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-06-01 17:08:30'),
('cfa79bcd-f82c-4a69-8273-45ce3666dda6', '51573297-bf82-4876-80ec-634b973d9fe1', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-06-01 17:15:55'),
('dae152c8-6d66-46ae-b95d-67c3b7bb817d', '51573297-bf82-4876-80ec-634b973d9fe1', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-06-01 17:15:55'),
('df6b9b29-1dc1-496a-989f-3376f38ac2bf', '793f87f9-b582-4408-b256-5317f5f40ab4', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-06-01 17:14:50');

-- --------------------------------------------------------

--
-- Table structure for table `iteneraryplaces`
--

CREATE TABLE `iteneraryplaces` (
  `placeID` varchar(36) NOT NULL,
  `iteneraryID` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `lat` float NOT NULL,
  `lon` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `iteneraryplaces`
--

INSERT INTO `iteneraryplaces` (`placeID`, `iteneraryID`, `name`, `lat`, `lon`) VALUES
('1035039b-1779-4b00-a67d-7e47650519a3', '902a10fb-622d-4f2a-91e2-85e02a665319', 'place1', 26.8042, 87.287),
('4824a043-1e37-414b-9a96-d8124d770101', 'b2e1076d-f1b9-4b7e-a94a-ec3768fa1283', 'road', 26.8076, 87.2849),
('4aee14c5-583b-467e-9a7e-b527ab6a756f', '41c90b0d-19fc-4949-85b3-20caed5f8adf', 'place', 26.8048, 87.2891),
('5728e9bd-5b0a-47fc-b389-dfaeef6bec1f', '902a10fb-622d-4f2a-91e2-85e02a665319', 'place2', 26.8082, 87.2834),
('71c6e519-f028-4a7a-87b9-d8c0f85878f6', '60cd8534-d4ca-405f-b024-e1ed32aa18a6', 'a', 26.8077, 87.288),
('76ea070c-45cd-490a-98bd-b9279f7f43fd', '07954856-2654-4a12-8642-352cb58f5f5b', 'place2', 26.8057, 87.2823),
('78c40727-3389-4530-bb23-4061dd0a2029', '0d9fd91c-cbc5-42ed-9ec3-60085a5e7a94', 'place', 26.8068, 87.285),
('7e36a8f8-2988-4fe4-918b-c71b47cc4d5b', 'b2e1076d-f1b9-4b7e-a94a-ec3768fa1283', 'ghar', 26.8071, 87.2851),
('a1d55414-adf5-4cf1-8e15-7499ac268e46', '07954856-2654-4a12-8642-352cb58f5f5b', 'place', 26.8084, 87.2883),
('b53b6918-036b-4b9c-93f5-16e00501dce3', '6dc9a5de-0cf9-44c4-8de5-3caafb690065', 'placename', 26.8074, 87.2858),
('cf60ea2a-b8bb-4488-91c0-5d6d203294b6', '51573297-bf82-4876-80ec-634b973d9fe1', 'it', 26.8076, 87.2887),
('f2a42235-5556-406a-a8fa-48f95b112755', '793f87f9-b582-4408-b256-5317f5f40ab4', 'place1', 26.8042, 87.2805);

-- --------------------------------------------------------

--
-- Table structure for table `iteneraryrating`
--

CREATE TABLE `iteneraryrating` (
  `ratingID` varchar(36) NOT NULL,
  `iteneraryID` varchar(36) NOT NULL,
  `userID` varchar(36) NOT NULL,
  `likes` tinyint(1) NOT NULL DEFAULT '0',
  `comment` text,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `iteneraryrating`
--

INSERT INTO `iteneraryrating` (`ratingID`, `iteneraryID`, `userID`, `likes`, `comment`, `time`) VALUES
('76d4c161-d79a-419c-8e4b-230df6def4a2', '0d9fd91c-cbc5-42ed-9ec3-60085a5e7a94', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 1, NULL, '2020-06-01 01:39:48'),
('807cb5c7-2e28-4591-8bf1-617f0dbd5c9f', '41c90b0d-19fc-4949-85b3-20caed5f8adf', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', -1, NULL, '2020-05-23 22:55:06'),
('e164e5dd-7af3-418d-beda-aac58479400c', 'b2e1076d-f1b9-4b7e-a94a-ec3768fa1283', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', -1, 'comment', '2020-05-25 18:12:50'),
('f6194e56-621f-453e-9023-6f36b7f29fa6', '60cd8534-d4ca-405f-b024-e1ed32aa18a6', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 1, 'update', '2020-06-01 01:43:01'),
('ffdb1313-b1c2-4b39-8770-ccd75ca31c76', '6dc9a5de-0cf9-44c4-8de5-3caafb690065', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', -1, 'new comment', '2020-06-01 01:42:21');

-- --------------------------------------------------------

--
-- Table structure for table `placephotos`
--

CREATE TABLE `placephotos` (
  `imageID` varchar(36) NOT NULL,
  `placeID` varchar(36) NOT NULL,
  `userID` varchar(36) NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `placephotos`
--

INSERT INTO `placephotos` (`imageID`, `placeID`, `userID`, `time`) VALUES
('22f75a5d-1247-4fce-93ad-a656b10add76', '9e91c336-ce3d-4760-8d10-1126c992c71e', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-30 15:52:17'),
('58ef2ab6-b339-4672-9d6e-b72d40edd1b4', '6cde312c-b87f-4b0e-8026-3f321226087d', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-29 17:05:11'),
('6bae1ae5-2911-42b7-b5fa-47d2a3c19b01', '9e91c336-ce3d-4760-8d10-1126c992c71e', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-30 15:50:36'),
('ad667d0d-dfa5-45f0-b1cc-3bc9f18fdc27', '9e91c336-ce3d-4760-8d10-1126c992c71e', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-30 15:52:25'),
('af16dd53-c91e-4276-a4ae-2085d88e7631', '6cde312c-b87f-4b0e-8026-3f321226087d', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-29 17:05:11'),
('ff20e97c-1a9e-4982-be1b-536de440c6cb', '9e91c336-ce3d-4760-8d10-1126c992c71e', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', '2020-05-30 15:49:14');

-- --------------------------------------------------------

--
-- Table structure for table `placerating`
--

CREATE TABLE `placerating` (
  `ratingID` varchar(36) NOT NULL,
  `placeID` varchar(36) NOT NULL,
  `userID` varchar(36) NOT NULL,
  `likes` tinyint(1) NOT NULL DEFAULT '0',
  `comment` text,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `placerating`
--

INSERT INTO `placerating` (`ratingID`, `placeID`, `userID`, `likes`, `comment`, `time`) VALUES
('fd87f27b-a3dc-4399-abfd-e880c30d1e45', '9e91c336-ce3d-4760-8d10-1126c992c71e', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 1, 'comment', '2020-05-28 17:56:53');

-- --------------------------------------------------------

--
-- Table structure for table `places`
--

CREATE TABLE `places` (
  `placeID` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `catagory` varchar(30) DEFAULT NULL,
  `description` text,
  `lat` float NOT NULL,
  `lon` float NOT NULL,
  `userID` varchar(36) NOT NULL,
  `rank` int(11) NOT NULL DEFAULT '0',
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `places`
--

INSERT INTO `places` (`placeID`, `name`, `catagory`, `description`, `lat`, `lon`, `userID`, `rank`, `time`) VALUES
('6cde312c-b87f-4b0e-8026-3f321226087d', 'place test', NULL, 'place description', 26.8082, 87.2874, 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-05-29 17:05:10'),
('81a1bd31-8d45-4e42-8bd0-d3d602990ec4', 'place test2', 'bakery', 'desc', 26.8063, 87.2856, 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-05-30 19:05:39'),
('9e91c336-ce3d-4760-8d10-1126c992c71e', 'Place2lite', 'clothing', 'desc', 26.8076, 87.2865, 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 1, '2020-05-23 22:20:11'),
('a932ce86-5223-471e-81db-41456787539a', 'place', 'bakery', '', 26.8084, 87.2868, 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-05-30 19:09:34'),
('f377e127-0e6e-4adc-baf2-4ede1eaf53d0', 'testagaun', 'bakery', '', 26.8083, 87.287, 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-05-30 19:08:16'),
('f99e8d61-fd5e-4bbe-8f72-464947211099', 'placetest2', 'church', 'test', 26.8064, 87.2862, 'b37b6d21-8bc6-48e5-82ab-d7d230666b30', 0, '2020-05-30 19:06:46');

-- --------------------------------------------------------

--
-- Table structure for table `userfavouriteitenerary`
--

CREATE TABLE `userfavouriteitenerary` (
  `iteneraryID` varchar(36) NOT NULL,
  `userID` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `userfavouriteitenerary`
--

INSERT INTO `userfavouriteitenerary` (`iteneraryID`, `userID`) VALUES
('41c90b0d-19fc-4949-85b3-20caed5f8adf', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30'),
('b2e1076d-f1b9-4b7e-a94a-ec3768fa1283', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30');

-- --------------------------------------------------------

--
-- Table structure for table `userfavouriteplaces`
--

CREATE TABLE `userfavouriteplaces` (
  `placeID` varchar(36) NOT NULL,
  `userID` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `userfavouriteplaces`
--

INSERT INTO `userfavouriteplaces` (`placeID`, `userID`) VALUES
('9e91c336-ce3d-4760-8d10-1126c992c71e', 'b37b6d21-8bc6-48e5-82ab-d7d230666b30');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `role` varchar(10) NOT NULL DEFAULT 'unverified',
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `name`, `email`, `password`, `role`, `time`) VALUES
('63985170-1495-4f78-89b6-ecccb437dde9', 'Test User 2', 'testemail2@email.com', '$2b$10$xwkke.ce7ft9CVvcbrpCs.ZhnwXpxRbsKVsD5XZEwGHEae.A9oLtG', 'unverified', '2020-05-12 20:45:14'),
('b37b6d21-8bc6-48e5-82ab-d7d230666b30', 'Test User', 'testemail@email.com', '$2b$10$.3T2vtzVfIcMyhGH9j/drOID3XEQwI8P1sZgKixLw4nCZj7J6cvI6', 'unverified', '2020-05-12 16:52:04'),
('c9917165-40fd-4412-a4c2-5a17c22e2941', 'name', 'testemail345@email.com', '$2b$10$/uvCVZ99QSVxmsODW1wxxO7cWTm3C/noPYvmne/NdDkCR94ob6Raq', 'unverified', '2020-06-05 22:25:24'),
('ea47450c-8bdd-4706-97ab-53113751d68b', 'testemailMan', 'testemail34@email.com', '$2b$10$J23D5DKKXTlLvTM4TFNNLOI1qhHVwXOBpdxTpPpdxv5VQ5qdpEulG', 'unverified', '2020-06-05 22:22:06'),
('fb7f82d2-3375-4d53-8909-551b61e2926a', 'test user3', 'testemail3@email.com', '$2b$10$PG7G63uDnOdAYoEwoUytoOhXGh/xKYCfVX1mup6jGETs2Hud3fW6y', 'unverified', '2020-05-23 21:48:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `itenerary`
--
ALTER TABLE `itenerary`
  ADD PRIMARY KEY (`iteneraryID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `iteneraryphotos`
--
ALTER TABLE `iteneraryphotos`
  ADD PRIMARY KEY (`imageID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `iteneraryID` (`iteneraryID`);

--
-- Indexes for table `iteneraryplaces`
--
ALTER TABLE `iteneraryplaces`
  ADD PRIMARY KEY (`placeID`),
  ADD KEY `iteneraryID` (`iteneraryID`);

--
-- Indexes for table `iteneraryrating`
--
ALTER TABLE `iteneraryrating`
  ADD PRIMARY KEY (`ratingID`),
  ADD UNIQUE KEY `iteneraryID` (`iteneraryID`,`userID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `iteneraryID_2` (`iteneraryID`);

--
-- Indexes for table `placephotos`
--
ALTER TABLE `placephotos`
  ADD PRIMARY KEY (`imageID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `placeID` (`placeID`);

--
-- Indexes for table `placerating`
--
ALTER TABLE `placerating`
  ADD PRIMARY KEY (`ratingID`),
  ADD UNIQUE KEY `placeID` (`placeID`,`userID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `placeID_2` (`placeID`);

--
-- Indexes for table `places`
--
ALTER TABLE `places`
  ADD PRIMARY KEY (`placeID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `userfavouriteitenerary`
--
ALTER TABLE `userfavouriteitenerary`
  ADD UNIQUE KEY `iteneraryID` (`iteneraryID`,`userID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `userfavouriteplaces`
--
ALTER TABLE `userfavouriteplaces`
  ADD UNIQUE KEY `placeID` (`placeID`,`userID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `itenerary`
--
ALTER TABLE `itenerary`
  ADD CONSTRAINT `itenerary_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `iteneraryphotos`
--
ALTER TABLE `iteneraryphotos`
  ADD CONSTRAINT `iteneraryphotos_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `iteneraryphotos_ibfk_2` FOREIGN KEY (`iteneraryID`) REFERENCES `itenerary` (`iteneraryID`) ON DELETE CASCADE;

--
-- Constraints for table `iteneraryplaces`
--
ALTER TABLE `iteneraryplaces`
  ADD CONSTRAINT `iteneraryplaces_ibfk_1` FOREIGN KEY (`iteneraryID`) REFERENCES `itenerary` (`iteneraryID`) ON DELETE CASCADE;

--
-- Constraints for table `iteneraryrating`
--
ALTER TABLE `iteneraryrating`
  ADD CONSTRAINT `iteneraryrating_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `iteneraryrating_ibfk_2` FOREIGN KEY (`iteneraryID`) REFERENCES `itenerary` (`iteneraryID`) ON DELETE CASCADE;

--
-- Constraints for table `placephotos`
--
ALTER TABLE `placephotos`
  ADD CONSTRAINT `placephotos_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `placephotos_ibfk_2` FOREIGN KEY (`placeID`) REFERENCES `places` (`placeID`) ON DELETE CASCADE;

--
-- Constraints for table `placerating`
--
ALTER TABLE `placerating`
  ADD CONSTRAINT `placerating_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `placerating_ibfk_2` FOREIGN KEY (`placeID`) REFERENCES `places` (`placeID`) ON DELETE CASCADE;

--
-- Constraints for table `places`
--
ALTER TABLE `places`
  ADD CONSTRAINT `places_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `userfavouriteitenerary`
--
ALTER TABLE `userfavouriteitenerary`
  ADD CONSTRAINT `userfavouriteitenerary_ibfk_1` FOREIGN KEY (`iteneraryID`) REFERENCES `itenerary` (`iteneraryID`) ON DELETE CASCADE,
  ADD CONSTRAINT `userfavouriteitenerary_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `userfavouriteplaces`
--
ALTER TABLE `userfavouriteplaces`
  ADD CONSTRAINT `userfavouriteplaces_ibfk_1` FOREIGN KEY (`placeID`) REFERENCES `places` (`placeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `userfavouriteplaces_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
