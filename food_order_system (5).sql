-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 19, 2026 at 01:26 PM
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
(7, 20, 'Home', 'jiglo', '1234569870', 'Ahir Vidhyarthi BHavan', 'Dwarka', 'gujrat', '321654', 1, '2026-09-15 10:06:01', '2026-09-15 10:06:01');

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
(1, 'Jigato', 'support@jigato.com', '7418520963', 'India', 40.00, 1500.00, 7.00, 100.00, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '2026-09-18 15:44:59', '2026-09-19 09:24:20');

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
(34, 'Khaman Dhokla', 'Soft and fluffy Gujarati khaman served with green chutney.', 80.00, 'Gujarati', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(35, 'Fafda Jalebi', 'Crispy fafda served with sweet jalebi and traditional chutney.', 120.00, 'Gujarati', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(36, 'Gujarati Thali', 'Complete Gujarati thali with dal, kadhi, sabzi, roti, rice and sweets.', 220.00, 'Gujarati', 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(37, 'Khandvi', 'Soft Gujarati gram flour rolls finished with mustard and sesame.', 90.00, 'Gujarati', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(38, 'Thepla', 'Fresh Gujarati methi thepla served with curd and pickle.', 70.00, 'Gujarati', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(39, 'Masala Dosa', 'Crispy dosa filled with delicious spiced potato masala.', 120.00, 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(40, 'Plain Dosa', 'Classic crispy South Indian dosa served with chutney and sambar.', 90.00, 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(41, 'Idli Sambar', 'Soft steamed idlis served with hot sambar and coconut chutney.', 80.00, 'South Indian', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(42, 'Medu Vada', 'Crispy South Indian vada served with sambar and coconut chutney.', 85.00, 'South Indian', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(43, 'Masala Uttapam', 'Thick soft uttapam topped with fresh vegetables and herbs.', 110.00, 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(44, 'Margherita Pizza', 'Classic cheesy pizza with tomato sauce, mozzarella and herbs.', 199.00, 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(45, 'Farmhouse Pizza', 'Loaded vegetarian pizza with capsicum, onion, tomato and cheese.', 249.00, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(46, 'Paneer Tikka Pizza', 'Cheesy pizza topped with spiced paneer tikka and vegetables.', 279.00, 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(47, 'Cheese Burst Pizza', 'Loaded cheese pizza with a rich and creamy cheese-filled crust.', 299.00, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(48, 'Veggie Delight Pizza', 'Fresh vegetables, mozzarella and Italian herbs on a crispy base.', 229.00, 'Pizza', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(49, 'Classic Veg Burger', 'Crispy veg patty with lettuce, tomato, onion and creamy sauce.', 129.00, 'Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(50, 'Cheese Veg Burger', 'Crispy vegetable patty loaded with melted cheese and fresh veggies.', 159.00, 'Burger', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(51, 'Paneer Burger', 'Spicy paneer patty with lettuce, onion and signature sauce.', 179.00, 'Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(52, 'Vada Pav', 'Mumbai-style batata vada served inside soft pav with chutneys.', 50.00, 'Street Food', 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(53, 'Pav Bhaji', 'Buttery pav served with spicy mixed vegetable bhaji and onions.', 110.00, 'Street Food', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(54, 'Samosa', 'Crispy pastry filled with spicy potato and peas.', 35.00, 'Street Food', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(55, 'Dahi Puri', 'Crispy puris filled with potato, curd, chutneys and sev.', 90.00, 'Street Food', 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(56, 'Pani Puri', 'Crispy puris filled with spicy tangy pani and potato mixture.', 60.00, 'Street Food', 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(57, 'Aloo Tikki Chaat', 'Crispy potato tikki topped with curd, chutneys and sev.', 90.00, 'Street Food', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(58, 'French Fries', 'Crispy golden fries seasoned with special masala.', 99.00, 'Fast Food', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(59, 'Peri Peri Fries', 'Crispy fries tossed in spicy peri peri seasoning.', 119.00, 'Fast Food', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(60, 'Veg Grilled Sandwich', 'Grilled sandwich loaded with vegetables, cheese and special sauce.', 130.00, 'Fast Food', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(61, 'Cheese Sandwich', 'Toasted sandwich packed with creamy melted cheese.', 120.00, 'Fast Food', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(62, 'Veg Cheese Wrap', 'Soft wrap filled with fresh vegetables, cheese and creamy dressing.', 149.00, 'Fast Food', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(63, 'White Sauce Pasta', 'Creamy pasta cooked with herbs, vegetables and white sauce.', 179.00, 'Pasta', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(64, 'Red Sauce Pasta', 'Italian pasta tossed in rich tomato sauce and herbs.', 169.00, 'Pasta', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(65, 'Cheesy Alfredo Pasta', 'Creamy cheesy pasta with herbs and parmesan-style sauce.', 199.00, 'Pasta', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(66, 'Veg Hakka Noodles', 'Stir-fried noodles with fresh vegetables and Chinese sauces.', 159.00, 'Chinese', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(67, 'Veg Fried Rice', 'Aromatic rice tossed with fresh vegetables and Asian sauces.', 149.00, 'Chinese', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(68, 'Veg Manchurian', 'Crispy vegetable balls tossed in spicy Indo-Chinese sauce.', 169.00, 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(69, 'Poha', 'Light and tasty flattened rice cooked with onion, peanuts and spices.', 60.00, 'Breakfast', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(70, 'Upma', 'Traditional South Indian breakfast made with semolina and vegetables.', 65.00, 'Breakfast', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(71, 'Masala Toast', 'Crispy toast topped with spiced vegetables and cheese.', 90.00, 'Breakfast', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(72, 'Gulab Jamun', 'Soft milk-solid dumplings soaked in warm sugar syrup.', 80.00, 'Dessert', 'https://images.unsplash.com/photo-1601303516534-6d1b1b4b9d72?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(73, 'Jalebi', 'Crispy golden jalebi soaked in sweet saffron sugar syrup.', 70.00, 'Dessert', 'https://images.unsplash.com/photo-1615837197154-2e801f4f3c3f?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(74, 'Chocolate Brownie', 'Rich chocolate brownie with a soft fudgy centre.', 120.00, 'Dessert', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476f?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(75, 'Cheesecake', 'Creamy cheesecake with a smooth and rich texture.', 160.00, 'Dessert', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(76, 'Fresh Orange Juice', 'Freshly prepared orange juice served chilled.', 90.00, 'Juice', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(77, 'Mango Juice', 'Refreshing sweet mango juice made with ripe mangoes.', 100.00, 'Juice', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(78, 'Watermelon Juice', 'Fresh chilled watermelon juice for a refreshing break.', 90.00, 'Juice', 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(79, 'Sweet Lassi', 'Thick chilled yogurt drink blended with sugar and cardamom.', 80.00, 'Drinks', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(80, 'Masala Chaas', 'Refreshing Gujarati-style spiced buttermilk.', 60.00, 'Drinks', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(81, 'Cold Coffee', 'Chilled creamy coffee blended with milk and ice.', 110.00, 'Beverages', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(82, 'Masala Chai', 'Hot Indian tea infused with aromatic spices.', 50.00, 'Beverages', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(83, 'Iced Tea', 'Refreshing chilled tea with lemon and ice.', 80.00, 'Beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45'),
(84, 'Classic Cold Drink', 'Chilled carbonated soft drink served with ice.', 60.00, 'Cold Drinks', 'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=80', 1, '2026-09-19 10:43:45');

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
(6, 'Welcome Offer - 20% OFF', 'Get 20% discount on your first food order.', 'WELCOME20', 'percentage', 20.00, 100.00, 199.00, 'welcome', '2026-09-19 00:00:00', '2026-12-31 23:59:59', 1000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(7, 'Flat ₹100 OFF', 'Get flat ₹100 discount on orders above ₹499.', 'FLAT100', 'flat', 100.00, NULL, 499.00, 'general', '2026-09-19 00:00:00', '2026-11-30 23:59:59', 2000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(8, 'Flat ₹50 OFF', 'Save ₹50 on your food order above ₹299.', 'SAVE50', 'flat', 50.00, NULL, 299.00, 'general', '2026-09-19 00:00:00', '2026-12-15 23:59:59', 3000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(9, 'Weekend Special - 25% OFF', 'Enjoy 25% OFF on your weekend cravings.', 'WEEKEND25', 'percentage', 25.00, 150.00, 399.00, 'general', '2026-09-19 00:00:00', '2026-12-31 23:59:59', 1500, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(10, 'Foodie Special - 15% OFF', 'Get 15% discount on orders above ₹249.', 'FOODIE15', 'percentage', 15.00, 100.00, 249.00, 'general', '2026-09-19 00:00:00', '2026-11-30 23:59:59', 5000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(11, 'Free Delivery', 'Get free delivery on orders above ₹299.', 'FREEDEL', 'free_delivery', 0.00, NULL, 299.00, 'free_delivery', '2026-09-19 00:00:00', '2026-12-31 23:59:59', 5000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(12, 'Big Order Deal - 30% OFF', 'Get 30% OFF on large orders above ₹699.', 'BIGDEAL30', 'percentage', 30.00, 200.00, 699.00, 'general', '2026-09-19 00:00:00', '2026-10-31 23:59:59', 1000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(13, 'Flat ₹75 OFF', 'Get flat ₹75 OFF on orders above ₹399.', 'SAVE75', 'flat', 75.00, NULL, 399.00, 'general', '2026-09-19 00:00:00', '2026-12-31 23:59:59', 2500, 1, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:32'),
(14, 'Super Saver - 20% OFF', 'Save 20% on your favourite food orders.', 'SUPER20', 'percentage', 20.00, 120.00, 349.00, 'general', '2026-09-19 00:00:00', '2026-11-15 23:59:59', 2000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00'),
(15, 'Free Delivery Weekend', 'Enjoy free delivery on orders above ₹199.', 'DELIVERYFREE', 'free_delivery', 0.00, NULL, 199.00, 'free_delivery', '2026-09-19 00:00:00', '2026-10-31 23:59:59', 3000, 0, 1, '2026-09-19 10:47:00', '2026-09-19 10:47:00');

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
(31, 20, 'jiglo', '1234569870', 'Ahir Vidhyarthi BHavan', 'Dwarka', 'gujrat', '321654', 941.00, 40.00, 65.87, 75.00, 'SAVE75', 971.87, 'COD', 'Pending', '2026-09-19 10:47:32', '2026-09-19 10:47:32', NULL);

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
(77, 31, 67, 1, 149.00),
(78, 31, 51, 1, 179.00),
(79, 31, 49, 1, 129.00),
(80, 31, 50, 1, 159.00),
(81, 31, 70, 1, 65.00),
(82, 31, 69, 1, 60.00),
(83, 31, 71, 1, 90.00),
(84, 31, 81, 1, 110.00);

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
  `pincode` varchar(10) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `city`, `password`, `role`, `created_at`, `address`, `state`, `pincode`, `status`) VALUES
(15, 'Ahir', 'admin@gmail.com', '7418520963', 'Dwarka', '$2b$10$FPjPfMKo67yFLW6GgxbgCO7uhN6AXnVFsdo4a6crTXUVOAplUfOiu', 'admin', '2026-09-14 13:43:25', NULL, NULL, NULL, 'active'),
(20, 'jigar', 'jigar@gmail.com', '1234569870', 'Dwarka', '$2b$10$TXspXoecM17zTsq1fGZYiOmdVv.o8NwYYE18gjZ2BXKic55WkULHW', 'customer', '2026-09-15 10:03:55', NULL, NULL, NULL, 'active');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `foods`
--
ALTER TABLE `foods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
