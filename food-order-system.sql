-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 15, 2026 at 05:08 PM
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
(1, 9, 'Home', 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 1, '2026-08-15 05:33:41', '2026-08-15 05:33:41'),
(2, 10, 'Home', 'JigloAayar', '6356499565', 'New Ahir Vidhyarthi Bhavan', 'Jamnagar', 'Gujrat', '361004', 1, '2026-08-15 07:35:21', '2026-08-15 07:35:21');

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
(65, 10, 15, 1, '2026-08-15 11:41:15');

-- --------------------------------------------------------

--
-- Table structure for table `foods`
--

CREATE TABLE `foods` (
  `id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
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

INSERT INTO `foods` (`id`, `restaurant_id`, `name`, `description`, `price`, `category`, `image`, `is_available`, `created_at`) VALUES
(6, 1, 'Veg Maharaja Burger', 'Double Veg Patty with Cheese', 199.00, 'Burger', 'vegmaharaja.jpg', 1, '2026-07-21 12:05:48'),
(7, 1, 'Aloo Tikki Burger', 'Crispy Aloo Patty Burger', 99.00, 'Burger', 'alootiki.jpg', 1, '2026-07-21 12:05:48'),
(8, 1, 'Paneer Burger', 'Grilled Paneer Burger', 149.00, 'Burger', 'paneerburger.jpg', 1, '2026-07-21 12:05:48'),
(9, 1, 'French Fries', 'Hot & Crispy Fries', 99.00, 'Snacks', 'fries.jpg', 1, '2026-07-21 12:05:48'),
(10, 1, 'Cheese Fries', 'Loaded Cheese Fries', 149.00, 'Snacks', 'cheesefries.jpg', 1, '2026-07-21 12:05:48'),
(11, 1, 'Veg Nuggets', 'Crunchy Veg Nuggets', 129.00, 'Snacks', 'vegnuggets.jpg', 1, '2026-07-21 12:05:48'),
(12, 1, 'Coke', 'Chilled Coca Cola', 49.00, 'Drinks', 'coke.jpg', 1, '2026-07-21 12:05:48'),
(13, 1, 'Sprite', 'Refreshing Sprite', 49.00, 'Drinks', 'sprite.jpg', 1, '2026-07-21 12:05:48'),
(14, 2, 'Margherita Pizza', 'Classic Cheese Pizza', 199.00, 'Pizza', 'margherita.jpg', 1, '2026-07-21 13:09:56'),
(15, 2, 'Farmhouse Pizza', 'Loaded with Fresh Veggies', 299.00, 'Pizza', 'farmhouse.jpg', 1, '2026-07-21 13:09:56'),
(16, 2, 'Peppy Paneer Pizza', 'Paneer, Capsicum & Red Paprika', 349.00, 'Pizza', 'peppypaneer.jpg', 1, '2026-07-21 13:09:56'),
(17, 2, 'Veg Extravaganza', 'Loaded with Veggies & Cheese', 399.00, 'Pizza', 'vegextravaganza.jpg', 1, '2026-07-21 13:09:56'),
(18, 2, 'Garlic Bread', 'Fresh Garlic Bread Sticks', 149.00, 'Snacks', 'garlicbread.jpg', 1, '2026-07-21 13:09:56'),
(19, 2, 'Cheesy Garlic Bread', 'Garlic Bread with Melted Cheese', 199.00, 'Snacks', 'cheesygarlicbread.jpg', 1, '2026-07-21 13:09:56'),
(20, 2, 'Coke', 'Chilled Coca-Cola', 49.00, 'Drinks', 'coke.jpg', 1, '2026-07-21 13:09:56'),
(21, 2, 'Sprite', 'Refreshing Sprite', 49.00, 'Drinks', 'sprite.jpg', 1, '2026-07-21 13:09:56'),
(22, 3, 'Paneer Tikka Pizza', 'Loaded with Paneer Tikka & Cheese', 349.00, 'Pizza', 'paneertikkapizza.jpg', 1, '2026-07-21 13:27:53'),
(23, 3, 'Veggie Supreme Pizza', 'Fresh Veggies with Mozzarella Cheese', 379.00, 'Pizza', 'veggiesupreme.jpg', 1, '2026-07-21 13:27:53'),
(24, 3, 'Cheese Burst Pizza', 'Extra Cheese Loaded Pizza', 429.00, 'Pizza', 'cheeseburstpizza.jpg', 1, '2026-07-21 13:27:53'),
(25, 3, 'Garlic Bread', 'Fresh Garlic Bread', 149.00, 'Snacks', 'garlicbread.jpg', 1, '2026-07-21 13:27:53'),
(26, 3, 'Cheese Garlic Bread', 'Garlic Bread with Cheese', 199.00, 'Snacks', 'cheesegarlicbread.jpg', 1, '2026-07-21 13:27:53'),
(27, 3, 'White Sauce Pasta', 'Creamy White Sauce Pasta', 229.00, 'Pasta', 'whitesaucepasta.jpg', 1, '2026-07-21 13:27:53'),
(28, 3, 'Veg Mexican Wrap', 'Loaded Veg Mexican Wrap', 199.00, 'Wrap', 'vegmexicanwrap.jpg', 1, '2026-07-21 13:27:53'),
(29, 3, 'Choco Lava Cake', 'Warm Chocolate Lava Cake', 129.00, 'Dessert', 'chocolavacake.jpg', 1, '2026-07-21 13:27:53'),
(30, 3, 'Cold Coffee', 'Chilled Cold Coffee', 119.00, 'Drinks', 'coldcoffee.jpg', 1, '2026-07-21 13:27:53'),
(31, 3, 'Fresh Lime Soda', 'Refreshing Lime Soda', 79.00, 'Drinks', 'freshlimesoda.jpg', 1, '2026-07-21 13:27:53');

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
  `offer_type` enum('general','welcome','restaurant','free_delivery') NOT NULL DEFAULT 'general',
  `restaurant_id` int(11) DEFAULT NULL,
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

INSERT INTO `offers` (`id`, `title`, `description`, `code`, `discount_type`, `discount_value`, `max_discount`, `min_order_amount`, `offer_type`, `restaurant_id`, `start_date`, `end_date`, `usage_limit`, `used_count`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Welcome Offer', 'Get 50% OFF on your first order.', 'WELCOME50', 'percentage', 50.00, 150.00, 299.00, 'welcome', NULL, '2026-08-15 11:21:10', '2026-09-14 11:21:10', 1000, 0, 1, '2026-08-15 05:51:10', '2026-08-15 05:51:10'),
(2, 'Flat ₹100 OFF', 'Get flat ₹100 OFF on orders above ₹499.', 'JIGATO100', 'flat', 100.00, 100.00, 499.00, 'general', NULL, '2026-08-15 11:21:10', '2026-09-14 11:21:10', 1000, 0, 1, '2026-08-15 05:51:10', '2026-08-15 05:51:10'),
(3, '20% OFF Food', 'Get 20% OFF on your food order.', 'FOOD20', 'percentage', 20.00, 200.00, 399.00, 'general', NULL, '2026-08-15 11:21:10', '2026-09-14 11:21:10', 500, 0, 1, '2026-08-15 05:51:10', '2026-08-15 05:51:10'),
(4, 'Free Delivery', 'Get free delivery on orders above ₹299.', 'FREEDEL', 'free_delivery', 0.00, NULL, 299.00, 'free_delivery', NULL, '2026-08-15 11:21:10', '2026-09-14 11:21:10', 1000, 0, 1, '2026-08-15 05:51:10', '2026-08-15 05:51:10');

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
  `cancelled_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `phone`, `address`, `city`, `state`, `pincode`, `subtotal`, `delivery_fee`, `gst`, `discount`, `coupon_code`, `total_amount`, `payment_method`, `order_status`, `created_at`, `updated_at`, `cancelled_at`) VALUES
(12, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 0.00, 0.00, 0.00, 0.00, NULL, 2079.10, 'COD', 'Out For Delivery', '2026-08-15 05:44:14', '2026-08-15 06:36:23', NULL),
(13, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 0.00, 0.00, 0.00, 0.00, NULL, 456.85, 'COD', 'Confirmed', '2026-08-15 06:04:17', '2026-08-15 06:37:13', NULL),
(14, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 0.00, 0.00, 0.00, 0.00, NULL, 461.20, 'COD', 'Delivered', '2026-08-15 06:06:46', '2026-08-15 06:37:22', NULL),
(15, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 947.00, 40.00, 47.35, 189.40, 'FOOD20', 844.95, 'COD', 'Cancelled', '2026-08-15 06:22:02', '2026-08-15 06:36:57', NULL),
(16, 10, 'JigloAayar', '6356499565', 'New Ahir Vidhyarthi Bhavan', 'Jamnagar', 'Gujrat', '361004', 957.00, 40.00, 47.85, 100.00, 'JIGATO100', 944.85, 'UPI', 'Delivered', '2026-08-15 07:36:11', '2026-08-15 07:38:04', NULL),
(17, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 10223.00, 40.00, 511.15, 0.00, NULL, 10774.15, 'CARD', 'Pending', '2026-08-15 08:55:37', '2026-08-15 08:55:37', NULL),
(18, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 1127.00, 40.00, 56.35, 0.00, NULL, 1223.35, 'UPI', 'Pending', '2026-08-15 09:43:20', '2026-08-15 09:43:20', NULL),
(19, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 397.00, 40.00, 19.85, 0.00, NULL, 456.85, 'UPI', 'Pending', '2026-08-15 11:47:48', '2026-08-15 11:47:48', NULL),
(20, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 838.00, 40.00, 41.90, 167.60, 'FOOD20', 752.30, 'COD', 'Pending', '2026-08-15 14:38:42', '2026-08-15 14:38:42', NULL),
(21, 9, 'JigarAhir', '6356499565', 'New Ahir Vidhyarthi Bhavan-2', 'Dwarka', 'gujrat', '123455', 397.00, 40.00, 19.85, 0.00, NULL, 456.85, 'CARD', 'Pending', '2026-08-15 14:46:15', '2026-08-15 14:46:15', NULL);

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
(28, 12, 14, 6, 199.00),
(29, 12, 17, 1, 399.00),
(30, 12, 16, 1, 349.00),
(31, 13, 20, 1, 49.00),
(32, 13, 15, 1, 299.00),
(33, 13, 21, 1, 49.00),
(34, 14, 21, 5, 49.00),
(35, 14, 15, 1, 299.00),
(36, 15, 14, 1, 199.00),
(37, 15, 17, 1, 399.00),
(38, 15, 16, 1, 349.00),
(39, 16, 23, 1, 379.00),
(40, 16, 25, 1, 149.00),
(41, 16, 24, 1, 429.00),
(42, 17, 23, 25, 379.00),
(43, 17, 17, 1, 399.00),
(44, 17, 16, 1, 349.00),
(45, 18, 17, 1, 399.00),
(46, 18, 16, 1, 349.00),
(47, 18, 23, 1, 379.00),
(48, 19, 20, 1, 49.00),
(49, 19, 15, 1, 299.00),
(50, 19, 21, 1, 49.00),
(51, 20, 20, 10, 49.00),
(52, 20, 21, 1, 49.00),
(53, 20, 15, 1, 299.00),
(54, 21, 15, 1, 299.00),
(55, 21, 20, 1, 49.00),
(56, 21, 21, 1, 49.00);

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
(1, 9, 'JigarAhir', '1234567890', '2006-08-07', 'Male', NULL, '2026-08-15 05:33:54', '2026-08-15 14:46:36'),
(2, 10, 'JigarAhir', '6356499565', NULL, NULL, NULL, '2026-08-15 07:34:42', '2026-08-15 07:34:42');

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `rating` decimal(2,1) DEFAULT 4.5,
  `delivery_time` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_open` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `name`, `image`, `category`, `city`, `rating`, `delivery_time`, `address`, `is_open`, `created_at`) VALUES
(1, 'Burger King', 'burgerking.jpg', 'Burger, Fast Food', 'Rajkot', 4.6, '25-30 min', 'Kalawad Road', 1, '2026-07-20 08:11:38'),
(2, 'Domino\'s Pizza', 'domino.jpg', 'Pizza', 'Rajkot', 4.5, '30-35 min', '150 Feet Ring Road', 1, '2026-07-20 08:11:38'),
(3, 'La Pino\'z Pizza', 'lapino.jpg', 'Pizza', 'Rajkot', 4.4, '20-25 min', 'Raiya Road', 1, '2026-07-20 08:11:38');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `city` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','owner','admin') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address` text DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `city`, `password`, `role`, `created_at`, `address`, `state`, `pincode`) VALUES
(4, 'jigar ahir', 'jigarahir1475@gmail.com', '0000000000', 'jamaNAGAr', '$2b$10$go3s5igyAzwvt5RorVyvR.Q0SKbpu94YGTmFp59Z/jDlXci4g0s9S', 'customer', '2026-07-19 08:47:33', NULL, NULL, NULL),
(5, 'Joshi', 'kjdemo@gmail.com', '9876543210', 'Jamnagar', '$2b$10$En4WgDdEoiEtLFraJwchFOaFUHxJVywYLJqu7ucs7gbNOgnatQkiS', 'customer', '2026-07-20 08:40:00', NULL, NULL, NULL),
(8, 'jigar ahir', 'jigarahir@gmail.com', '1231231231', 'Jamnagar', '$2b$10$Ki4zY1.of2i8I25wY4uQkOdndAq.fObQvwjTGltiOKUM7QlOaIXNK', 'customer', '2026-07-24 09:54:05', NULL, NULL, NULL),
(9, 'JigarAhir', 'proscammer1998@gmail.com', '1234567890', 'Dwarkaa', '$2b$10$539V4oTOPCpOwS.Scb39YecNY5YA838xim3ub4AXcYKK3eKtqIF3W', 'customer', '2026-08-15 05:32:34', NULL, NULL, NULL),
(10, 'JigarAhir', 'jigar@gmail.com', '6356499565', 'Jamnagar', '$2b$10$q79J6E/VVVYAMdUiSzvZcesKF0WjxXn.hKOq/geig8sqxQQIkxhSK', 'customer', '2026-08-15 07:33:23', NULL, NULL, NULL);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_coupon_code` (`code`),
  ADD KEY `idx_offer_restaurant` (`restaurant_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `food_id` (`food_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `foods`
--
ALTER TABLE `foods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
-- Constraints for table `foods`
--
ALTER TABLE `foods`
  ADD CONSTRAINT `foods_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `offers`
--
ALTER TABLE `offers`
  ADD CONSTRAINT `fk_offer_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`);

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
