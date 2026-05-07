-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 07, 2026 at 12:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dt_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cartitem`
--

CREATE TABLE `cartitem` (
  `id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `cartId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES
('cmoumqls60005v00kivtizl52', 'Electronics', 'Electronic devices and gadgets', '2026-05-06 22:29:24.294', '2026-05-06 22:29:24.294'),
('cmoumqlsb0006v00k8adlhl8s', 'Phones & Tablets', 'Mobile phones and tablets', '2026-05-06 22:29:24.295', '2026-05-06 22:29:24.295'),
('cmoumqlsb0007v00k91jgefn9', 'Fashion', 'Clothing, shoes, and accessories', '2026-05-06 22:29:24.294', '2026-05-06 22:29:24.294'),
('cmoumqlsc0008v00kkvtxqm0h', 'Beauty & Health', 'Skincare, makeup, and health products', '2026-05-06 22:29:24.294', '2026-05-06 22:29:24.294'),
('cmoumqlsc0009v00k8id4l6fl', 'Home & Living', 'Furniture, decor, and kitchenware', '2026-05-06 22:29:24.294', '2026-05-06 22:29:24.294'),
('cmoumqlsd000av00kt53p05j2', 'Computers', 'Laptops, desktops, and components', '2026-05-06 22:29:24.295', '2026-05-06 22:29:24.295'),
('cmoumqlsh000bv00kz466vtpk', 'Baby & Kids', 'Toys, clothing, and baby gear', '2026-05-06 22:29:24.295', '2026-05-06 22:29:24.295'),
('cmoumqlsi000cv00kg93ytwex', 'Sports & Outdoors', 'Fitness equipment and outdoor gear', '2026-05-06 22:29:24.295', '2026-05-06 22:29:24.295'),
('cmoumqlsk000dv00kiqcniubw', 'Automotive', 'Car parts and accessories', '2026-05-06 22:29:24.295', '2026-05-06 22:29:24.295'),
('cmoumqlsm000ev00k5m08dyl4', 'Groceries', 'Food, drinks, and household items', '2026-05-06 22:29:24.295', '2026-05-06 22:29:24.295');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` varchar(191) NOT NULL,
  `total` double NOT NULL,
  `status` enum('PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `userId` varchar(191) NOT NULL,
  `vendorId` varchar(191) NOT NULL,
  `shippingAddress` varchar(191) DEFAULT NULL,
  `contactPhone` varchar(191) DEFAULT NULL,
  `paystackReference` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orderitem`
--

CREATE TABLE `orderitem` (
  `id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `price` double NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `vendorId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `name`, `description`, `price`, `stock`, `images`, `vendorId`, `categoryId`, `createdAt`, `updatedAt`) VALUES
('cmoumqlsw000gv00kpfd3co2y', 'Smartphone X', 'The latest smartphone model', 999.99, 50, '[]', 'cmoumqlrv0003v00kx86jgudc', 'cmoumqls60005v00kivtizl52', '2026-05-06 22:29:24.320', '2026-05-06 22:29:24.320');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `role` enum('CUSTOMER','VENDOR','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `name`, `password`, `emailVerified`, `image`, `role`, `createdAt`, `updatedAt`) VALUES
('cmoumqlmu0000v00kbb93wbxv', 'admin@admin.com', 'Site Admin', '$2b$10$JrbzikXPQikQoBnVHubAVOaqzl0wmZ6iInJbWO.RADmdDwmMglpjC', NULL, NULL, 'ADMIN', '2026-05-06 22:29:24.102', '2026-05-06 22:29:24.102'),
('cmoumqlro0001v00k5zfwqgjo', 'vendor@example.com', 'Vendor User', '$2b$10$VOHol.1NLP0aDN3ZXdlGYe8L5trDM.FRSMn2NfDWoifsngrrc93p6', NULL, NULL, 'VENDOR', '2026-05-06 22:29:24.277', '2026-05-06 22:29:24.277'),
('cmoumqls00004v00kaea06iyl', 'customer@example.com', 'Customer User', '$2b$10$VOHol.1NLP0aDN3ZXdlGYe8L5trDM.FRSMn2NfDWoifsngrrc93p6', NULL, NULL, 'CUSTOMER', '2026-05-06 22:29:24.288', '2026-05-06 22:29:24.288');

-- --------------------------------------------------------

--
-- Table structure for table `vendor`
--

CREATE TABLE `vendor` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `banner` varchar(191) DEFAULT NULL,
  `userId` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendor`
--

INSERT INTO `vendor` (`id`, `name`, `description`, `slug`, `email`, `phone`, `logo`, `banner`, `userId`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cmoumqlrv0003v00kx86jgudc', 'Awesome Electronics', 'The best electronics store', NULL, NULL, NULL, NULL, NULL, 'cmoumqlro0001v00k5zfwqgjo', 1, '2026-05-06 22:29:24.284', '2026-05-06 22:29:24.284');

-- --------------------------------------------------------

--
-- Table structure for table `verificationtoken`
--

CREATE TABLE `verificationtoken` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0a43ce1b-b4d3-4b29-adc6-66b9ffec3e8a', '3be15678777ff89cbbd1e557c408a3898bfb43d2f1be61541a0926e62e71a237', '2026-05-06 20:29:16.708', '20260506202913_init_mysql', NULL, NULL, '2026-05-06 20:29:13.056', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  ADD KEY `Account_userId_fkey` (`userId`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Cart_userId_key` (`userId`);

--
-- Indexes for table `cartitem`
--
ALTER TABLE `cartitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CartItem_cartId_fkey` (`cartId`),
  ADD KEY `CartItem_productId_fkey` (`productId`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Category_name_key` (`name`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Order_paystackReference_key` (`paystackReference`),
  ADD KEY `Order_userId_fkey` (`userId`),
  ADD KEY `Order_vendorId_fkey` (`vendorId`);

--
-- Indexes for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_fkey` (`orderId`),
  ADD KEY `OrderItem_productId_fkey` (`productId`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Product_vendorId_fkey` (`vendorId`),
  ADD KEY `Product_categoryId_fkey` (`categoryId`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Review_userId_fkey` (`userId`),
  ADD KEY `Review_productId_fkey` (`productId`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  ADD KEY `Session_userId_fkey` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `vendor`
--
ALTER TABLE `vendor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Vendor_userId_key` (`userId`),
  ADD UNIQUE KEY `Vendor_slug_key` (`slug`);

--
-- Indexes for table `verificationtoken`
--
ALTER TABLE `verificationtoken`
  ADD UNIQUE KEY `VerificationToken_token_key` (`token`),
  ADD UNIQUE KEY `VerificationToken_identifier_token_key` (`identifier`,`token`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cartitem`
--
ALTER TABLE `cartitem`
  ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `cart` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vendor`
--
ALTER TABLE `vendor`
  ADD CONSTRAINT `Vendor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
