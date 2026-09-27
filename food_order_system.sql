-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 27, 2026 at 07:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `food_order_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_label` varchar(50) DEFAULT 'Home',
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `address_label`, `full_name`, `phone`, `address`, `city`, `state`, `pincode`, `is_default`, `created_at`, `updated_at`) VALUES
(18, 33, 'Home', 'GOJIYA JIGAR', '6356499565', 'New Ahir Vidhyarthi-2 jamnagar', 'Jamnagar', 'India', '123123', 1, '2026-09-26 18:14:36', '2026-09-26 18:15:06');

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `id` int(11) NOT NULL,
  `app_name` varchar(100) NOT NULL DEFAULT 'Jigato',
  `support_email` varchar(150) DEFAULT NULL,
  `support_phone` varchar(20) DEFAULT NULL,
  `default_city` varchar(100) DEFAULT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 40.00,
  `free_delivery_above` decimal(10,2) NOT NULL DEFAULT 500.00,
  `gst_rate` decimal(5,2) NOT NULL DEFAULT 5.00,
  `minimum_order` decimal(10,2) NOT NULL DEFAULT 100.00,
  `payment_cod` tinyint(1) NOT NULL DEFAULT 1,
  `payment_upi` tinyint(1) NOT NULL DEFAULT 1,
  `payment_card` tinyint(1) NOT NULL DEFAULT 1,
  `offers_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `coupons_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `free_delivery_offers` tinyint(1) NOT NULL DEFAULT 1,
  `new_order_alert` tinyint(1) NOT NULL DEFAULT 1,
  `order_status_alert` tinyint(1) NOT NULL DEFAULT 1,
  `new_customer_alert` tinyint(1) NOT NULL DEFAULT 1,
  `offer_expiry_alert` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`id`, `app_name`, `support_email`, `support_phone`, `default_city`, `delivery_fee`, `free_delivery_above`, `gst_rate`, `minimum_order`, `payment_cod`, `payment_upi`, `payment_card`, `offers_enabled`, `coupons_enabled`, `free_delivery_offers`, `new_order_alert`, `order_status_alert`, `new_customer_alert`, `offer_expiry_alert`, `created_at`, `updated_at`) VALUES
(1, 'Jigato', 'support@jigato.com', '7418520963', 'India', 50.00, 300.00, 5.00, 100.00, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, '2026-09-18 15:44:59', '2026-09-26 18:30:49');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `food_id`, `quantity`, `created_at`) VALUES
(230, 32, 86, 1, '2026-09-26 17:23:08');

-- --------------------------------------------------------

--
-- Table structure for table `foods`
--

CREATE TABLE `foods` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `foods`
--

INSERT INTO `foods` (`id`, `name`, `description`, `price`, `category`, `image`, `is_available`, `created_at`) VALUES
(86, 'vegggggggggggg', 'Hello tu,mhari masi ka land', 70.00, 'Pizza', 'alootiki.jpg', 1, '2026-09-26 09:22:32'),
(87, 'martinoz pizza', 'veg pizza', 200.00, 'Pizza', 'food-1790447335546-4daa0615c5405828c11473f9.jpg', 1, '2026-09-26 18:18:26');

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','flat','free_delivery') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `offer_type` enum('general','welcome','free_delivery') NOT NULL DEFAULT 'general',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `title`, `description`, `code`, `discount_type`, `discount_value`, `max_discount`, `min_order_amount`, `offer_type`, `start_date`, `end_date`, `usage_limit`, `used_count`, `is_active`, `created_at`, `updated_at`) VALUES
(17, 'FIRSTORDERrrr', 'First Order Flat 10%', 'FIRSTTTTT', 'percentage', 10.00, 300.00, 100.00, 'general', '2026-09-26 23:12:00', '2026-09-27 23:12:00', NULL, 0, 1, '2026-09-26 17:43:03', '2026-09-26 18:12:45');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gst` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('COD','UPI','CARD') DEFAULT 'COD',
  `order_status` enum('Pending','Confirmed','Preparing','Out For Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cancelled_at` datetime DEFAULT NULL,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `order_number` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `phone`, `address`, `city`, `state`, `pincode`, `subtotal`, `delivery_fee`, `gst`, `discount`, `coupon_code`, `total_amount`, `payment_method`, `order_status`, `created_at`, `updated_at`, `cancelled_at`, `cancellation_reason`, `order_number`) VALUES
(80, 33, 'GOJIYA JIGAR', '6356499565', 'New Ahir Vidhyarthi-2 jamnagar', 'Jamnagar', 'India', '123123', 900.00, 0.00, 45.00, 70.00, 'FIRSTTTTT', 875.00, 'UPI', 'Cancelled', '2026-09-26 18:18:51', '2026-09-26 18:19:11', '2026-09-26 23:49:11', NULL, 'JGO-20260926-FXTNHB2K'),
(81, 33, 'GOJIYA JIGAR', '6356499565', 'New Ahir Vidhyarthi-2 jamnagar', 'Jamnagar', 'India', '123123', 470.00, 0.00, 23.50, 47.00, 'FIRSTTTTT', 446.50, 'UPI', 'Delivered', '2026-09-26 18:20:23', '2026-09-26 18:23:37', NULL, NULL, 'JGO-20260926-8KS9XBP7'),
(82, 33, 'GOJIYA JIGAR', '6356499565', 'New Ahir Vidhyarthi-2 jamnagar', 'Jamnagar', 'India', '123123', 200.00, 0.00, 10.00, 0.00, NULL, 210.00, 'UPI', 'Pending', '2026-09-26 18:29:05', '2026-09-26 18:29:05', NULL, NULL, 'JGO-20260926-8HT5XF24'),
(83, 33, 'GOJIYA JIGAR', '6356499565', 'New Ahir Vidhyarthi-2 jamnagar', 'Jamnagar', 'India', '123123', 200.00, 50.00, 10.00, 0.00, NULL, 260.00, 'UPI', 'Pending', '2026-09-26 18:30:55', '2026-09-26 18:30:55', NULL, NULL, 'JGO-20260927-U7AKCCTK');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `food_id`, `quantity`, `price`) VALUES
(181, 80, 87, 1, 200.00),
(182, 80, 86, 10, 70.00),
(183, 81, 86, 1, 70.00),
(184, 81, 87, 2, 200.00),
(185, 82, 87, 1, 200.00),
(186, 83, 87, 1, 200.00);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at`) VALUES
(26, 33, '0d62f0b15b18d5da206b14b55f19d055f91a0ec2af51cbc049e3e9ed0b4c1233', '2026-09-27 00:09:42', '2026-09-26 23:56:22', '2026-09-26 18:24:42');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(30) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `full_name`, `phone`, `date_of_birth`, `gender`, `profile_image`, `created_at`, `updated_at`) VALUES
(5, 33, 'GOJIYA JIGAR', '6356499565', '2026-09-26', 'Male', NULL, '2026-09-26 18:14:15', '2026-09-26 18:14:15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('customer','owner','admin') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address` text DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `google_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `city`, `password`, `role`, `created_at`, `address`, `state`, `pincode`, `status`, `google_id`) VALUES
(15, 'admin', 'admin@gmail.com', '7418520963', 'Dwarka', '$2b$10$iwtGOI0GJwme2bUKAlthZuZgp4uTw5iLqHThkbCz9D6qztq2XAGH.', 'admin', '2026-09-14 13:43:25', NULL, NULL, NULL, 'active', NULL),
(32, 'Scammer', 'proscammer1998@gmail.com', '1234568888', 'jamnagar', '$2b$10$opwH7VtCiSMaqA0TIwwpu.nonMmYtwGEPtNci1ZuuHvWc/2UrcFEi', 'customer', '2026-09-26 17:22:59', NULL, NULL, NULL, 'active', NULL),
(33, 'GOJIYA JIGAR', 'gojiyajigar9095@gmail.com', '6356499565', 'Jamnagar', '$2b$10$WDgIfVpNZIPGx29hPilluu4ryTaT2JgiyGqRMSm.WNsfSp9p.mt.u', 'customer', '2026-09-26 18:00:04', 'New Ahir Vidhyarthi-2 jamnagar', 'India', '123123', 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_label` varchar(50) DEFAULT 'Home',
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `food_id` (`food_id`);

--
-- Indexes for table `foods`
--
ALTER TABLE `foods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_coupon_code` (`code`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `food_id` (`food_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_token_hash` (`token_hash`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `google_id` (`google_id`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=237;

--
-- AUTO_INCREMENT for table `foods`
--
ALTER TABLE `foods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
