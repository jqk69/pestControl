-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 28, 2025 at 12:33 PM
-- Server version: 8.0.41
-- PHP Version: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pest_control`
--

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `content`, `date`) VALUES
(7, 'Weekly Pest Control Blog', '<h1 class=\"blog-title text-4xl font-extrabold text-white bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-6\">\n    Pest Control in India: Latest Trends and Tips for a Pest-Free Home\n</h1>\n\n<p class=\"blog-intro text-gray-200 text-lg max-w-3xl mb-8\">\n    As we continue to navigate the complexities of modern living, pest control remains a pressing concern for homeowners and businesses across India. The Indian Pest Control Association (IPCA) has been at the forefront of promoting effective pest management practices, and recent developments in AI-driven pest detection and sustainable farming methods are revolutionizing the way we approach pest control. In this blog post, we\'ll explore the latest trends and provide valuable tips on how to keep your home pest-free.\n</p>\n\n<div class=\"blog-section bg-white/5 border border-white/10 rounded-xl p-6 mb-8\">\n    <h2 class=\"blog-section-title text-2xl font-bold text-white mb-4 flex items-center gap-2\">\n        <span>IPCA\'s Efforts in Promoting Pest Control</span>\n    </h2>\n    <p class=\"blog-content text-gray-300 text-base mb-6\">\n        The Indian Pest Control Association (IPCA) is a non-profit trade association of professional pest management companies in India. Recently, IPCA became a founder member of the Global Pest Management Coalition (GPMC), highlighting its commitment to promoting effective pest management practices globally. IPCA also observed World Pest Day on June 6, 2019, to raise awareness about the importance of pest control.\n    </p>\n</div>\n\n<div class=\"blog-section bg-white/5 border border-white/10 rounded-xl p-6 mb-8\">\n    <h2 class=\"blog-section-title text-2xl font-bold text-white mb-4 flex items-center gap-2\">\n        <span>Emerging Pest Threats in India</span>\n    </h2>\n    <ul class=\"blog-list list-disc pl-6 text-gray-300 text-base mb-6\">\n        <li>Tuta absoluta, a new invasive pest threatening coconut crops in India</li>\n        <li>AI-driven pest detection schemes to help farmers identify and manage pest infestations effectively</li>\n        <li>Rising concerns about sustainable farming practices and the use of biocontrol agents to reduce pest populations</li>\n    </ul>\n</div>\n\n<div class=\"blog-section bg-white/5 border border-white/10 rounded-xl p-6 mb-8\">\n    <h2 class=\"blog-section-title text-2xl font-bold text-white mb-4 flex items-center gap-2\">\n        <span>Tips to Keep Your Home Pest-Free</span>\n    </h2>\n    <ul class=\"blog-list list-disc pl-6 text-gray-300 text-base mb-6\">\n        <li><strong>Seal all entry points</strong>: Regularly inspect your home\'s foundation, walls, and roof for any gaps or cracks that may be allowing pests to enter.</li>\n        <li><strong>Keep your home clean</strong>: Regularly clean up crumbs, spills, and debris to prevent attracting pests.</li>\n        <li><strong>Eliminate standing water</strong>: Keep your home free of standing water, which can attract pests like mosquitoes and rodents.</li>\n    </ul>\n</div>\n\n<p class=\"blog-conclusion text-gray-200 text-lg mt-8\">\n    <strong>Conclusion</strong>: Effective pest control requires a multi-faceted approach that incorporates the latest trends and technologies. By staying informed about emerging pest threats, adopting sustainable farming practices, and following simple tips to keep your home pest-free, you can protect your family and property from the risks associated with pest infestations.\n</p>', '2025-07-20 13:54:39');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `service_id` int NOT NULL,
  `booking_date` datetime NOT NULL,
  `location_lat` decimal(10,8) NOT NULL,
  `location_lng` decimal(11,8) NOT NULL,
  `requirements` text,
  `status` enum('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `feedback` varchar(200) NOT NULL,
  `sentiment` varchar(30) NOT NULL,
  PRIMARY KEY (`booking_id`),
  KEY `service_id` (`service_id`),
  KEY `fk_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `user_id`, `service_id`, `booking_date`, `location_lat`, `location_lng`, `requirements`, `status`, `created_at`, `updated_at`, `feedback`, `sentiment`) VALUES
(27, 4, 8, '2025-05-31 09:00:00', '20.04715919', '82.58223161', '', 'completed', '2025-05-30 10:35:04', '2025-06-18 17:31:02', 'very good service i liked it', 'positive'),
(28, 4, 8, '2025-06-12 11:00:00', '31.42866312', '57.00380545', '', 'cancelled', '2025-06-01 10:31:53', '2025-07-28 10:02:10', '', ''),
(31, 4, 8, '2025-06-12 16:30:00', '9.92015492', '76.29829752', '', 'cancelled', '2025-06-02 09:24:37', '2025-07-28 10:02:10', '', ''),
(34, 4, 7, '2025-06-27 10:30:00', '20.24158282', '76.17046870', '', 'cancelled', '2025-06-02 09:34:55', '2025-07-28 07:35:58', '', ''),
(42, 4, 7, '2025-06-04 09:00:00', '20.96143961', '76.28906250', '', 'cancelled', '2025-06-02 10:08:01', '2025-07-28 07:35:58', '', ''),
(43, 4, 7, '2025-06-21 09:00:00', '21.82070785', '82.13378906', '', 'cancelled', '2025-06-02 10:08:43', '2025-07-28 07:35:58', '', ''),
(44, 4, 7, '2025-06-18 09:00:00', '10.10412470', '76.35684364', '', 'cancelled', '2025-06-09 09:26:25', '2025-07-28 07:35:58', '', ''),
(45, 4, 7, '2025-06-20 09:00:00', '10.10376342', '76.36149215', 'yes', 'cancelled', '2025-06-09 09:26:54', '2025-07-28 07:35:58', '', ''),
(46, 4, 10, '2025-07-12 16:30:00', '10.10398451', '76.36003372', '', 'cancelled', '2025-06-09 09:27:19', '2025-07-28 07:35:58', '', ''),
(47, 7, 8, '2025-06-19 09:00:00', '10.04999774', '76.32873328', '', 'cancelled', '2025-06-10 11:58:15', '2025-07-28 10:02:10', '', ''),
(48, 4, 7, '2025-06-17 17:00:00', '9.96604173', '76.24650995', '', 'completed', '2025-06-16 10:42:00', '2025-07-04 07:13:21', 'very good', 'positive'),
(49, 4, 7, '2025-06-17 09:00:00', '9.96589848', '76.69538563', '', 'cancelled', '2025-06-16 10:44:17', '2025-07-28 10:02:10', '', ''),
(50, 4, 7, '2025-06-19 10:30:00', '12.22777391', '76.43160577', '', 'cancelled', '2025-06-17 07:50:43', '2025-07-28 10:02:10', '', ''),
(52, 4, 10, '2025-06-19 09:00:00', '8.59780917', '76.73951091', '', 'cancelled', '2025-06-18 11:34:41', '2025-07-28 07:35:58', '', ''),
(53, 4, 7, '2025-06-23 09:00:00', '10.10776820', '76.35685320', '', 'cancelled', '2025-06-22 03:34:38', '2025-07-28 10:02:10', '', ''),
(54, 4, 7, '2025-06-25 10:00:00', '8.58102122', '77.64753747', '', 'completed', '2025-06-24 05:50:14', '2025-07-04 07:13:00', '', ''),
(55, 4, 7, '2025-07-03 09:00:00', '8.78478432', '76.88555975', '', 'cancelled', '2025-06-29 14:25:51', '2025-07-28 10:02:10', '', ''),
(56, 4, 10, '2025-07-10 10:30:00', '13.32548489', '77.78320313', '', 'cancelled', '2025-07-01 11:08:21', '2025-07-28 07:35:58', '', ''),
(57, 4, 10, '2025-07-11 17:00:00', '12.94032213', '76.36144805', '', 'cancelled', '2025-07-01 11:09:08', '2025-07-28 07:35:58', '', ''),
(58, 4, 7, '2025-07-30 09:00:00', '18.22761212', '83.09538881', '', 'confirmed', '2025-07-03 08:57:17', '2025-07-03 14:27:48', '', ''),
(59, 4, 7, '2025-07-17 09:00:00', '13.35063680', '76.20711431', '', 'cancelled', '2025-07-04 01:40:09', '2025-07-28 10:02:10', '', ''),
(60, 4, 24, '2025-07-23 12:00:00', '9.99512170', '76.29203930', '', 'cancelled', '2025-07-14 03:32:24', '2025-07-28 10:02:10', '', '');

--
-- Triggers `bookings`
--
DROP TRIGGER IF EXISTS `notify_new_booking`;
DELIMITER $$
CREATE TRIGGER `notify_new_booking` AFTER INSERT ON `bookings` FOR EACH ROW BEGIN
    -- Notify admin about new booking
    INSERT INTO `notifications` (`user_type`, `message`)
    VALUES (
        'admin', 
        CONCAT('New booking #', NEW.booking_id, ' for service: ', 
              (SELECT `name` FROM `services` WHERE `service_id` = NEW.service_id))
    );
    
    -- Notify user about their booking confirmation
    INSERT INTO `notifications` (`user_type`, `message`, `user_id`)
    SELECT 'user', 
           CONCAT('Your booking #', NEW.booking_id, ' is confirmed for ', 
                 DATE_FORMAT(NEW.booking_date, '%W, %M %e at %l:%i %p')),
           NEW.user_id
    FROM `users` WHERE `id` = NEW.user_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `booking_technicians`
--

DROP TABLE IF EXISTS `booking_technicians`;
CREATE TABLE IF NOT EXISTS `booking_technicians` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `technician_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `technician_id` (`technician_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `booking_technicians`
--

INSERT INTO `booking_technicians` (`id`, `booking_id`, `technician_id`, `assigned_at`) VALUES
(1, 27, 5, '2025-05-30 16:05:04'),
(2, 27, 6, '2025-05-30 16:05:04'),
(3, 28, 5, '2025-06-01 16:01:53'),
(4, 28, 6, '2025-06-01 16:01:53'),
(7, 31, 5, '2025-06-02 14:54:37'),
(8, 31, 6, '2025-06-02 14:54:37'),
(9, 34, 5, '2025-06-02 15:04:54'),
(24, 42, 6, '2025-06-02 15:38:00'),
(25, 43, 6, '2025-06-02 15:38:42'),
(26, 44, 6, '2025-06-09 14:56:24'),
(27, 45, 6, '2025-06-09 14:56:54'),
(28, 46, 6, '2025-06-09 14:57:18'),
(29, 47, 5, '2025-06-10 17:28:14'),
(30, 47, 6, '2025-06-10 17:28:14'),
(31, 48, 5, '2025-06-16 16:11:59'),
(32, 49, 5, '2025-06-16 16:14:17'),
(33, 50, 5, '2025-06-17 13:20:42'),
(34, 52, 5, '2025-06-18 17:04:41'),
(35, 53, 5, '2025-06-22 09:04:38'),
(36, 54, 5, '2025-06-24 11:20:13'),
(37, 55, 5, '2025-06-29 19:55:51'),
(38, 56, 5, '2025-07-01 16:38:21'),
(39, 57, 6, '2025-07-01 16:39:07'),
(40, 58, 5, '2025-07-03 14:27:16'),
(41, 59, 6, '2025-07-04 07:10:08'),
(42, 60, 6, '2025-07-14 09:02:24'),
(43, 60, 5, '2025-07-14 09:02:24');

--
-- Triggers `booking_technicians`
--
DROP TRIGGER IF EXISTS `trg_notify_technician_after_assignment`;
DELIMITER $$
CREATE TRIGGER `trg_notify_technician_after_assignment` AFTER INSERT ON `booking_technicians` FOR EACH ROW BEGIN
    DECLARE serviceName VARCHAR(255);
    DECLARE bookingDate DATETIME;

    -- Get the service name and booking date from the bookings table
    SELECT s.name, b.booking_date
    INTO serviceName, bookingDate
    FROM bookings b
    JOIN services s ON b.service_id = s.service_id
    WHERE b.booking_id = NEW.booking_id;

    -- Insert notification for the technician
    INSERT INTO notifications (user_type, message, user_id)
    VALUES (
        'technician',
        CONCAT('You have been assigned a new service: ', serviceName,
               ' on ', DATE_FORMAT(bookingDate, '%W, %M %e at %l:%i %p')),
        NEW.technician_id
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `quantity` int DEFAULT '1',
  `status` enum('in_cart','ordered','shipped','delivered','cancelled') DEFAULT 'in_cart',
  `delivery_address` text,
  `phone` varchar(15) DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`cart_id`, `user_id`, `product_id`, `quantity`, `status`, `delivery_address`, `phone`, `order_date`, `updated_at`) VALUES
(3, 4, 4, 1, 'cancelled', 'kerala, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '7907223527', '2025-06-05 17:55:30', '2025-06-15 19:56:56'),
(4, 4, 2, 3, 'delivered', 'kerala, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683563', '7907223527', '2025-06-05 17:56:45', '2025-07-26 06:02:37'),
(5, 4, 5, 3, 'cancelled', 'kerala, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683563', '7907223527', '2025-06-05 17:56:45', '2025-06-15 19:56:30'),
(6, 7, 21, 1, 'delivered', 'kochi, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683563', '1231231234', '2025-06-10 17:25:17', '2025-07-26 06:02:37'),
(7, 4, 1, 1, 'delivered', 'sfsdf, sfadfs, fadfaf', '89359853535', '2025-06-15 19:55:17', '2025-07-26 06:02:37'),
(8, 4, 1, 2, 'cancelled', 'sdfgsdsf, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '79077223527', '2025-06-21 09:59:12', '2025-06-22 05:59:48'),
(9, 4, 2, 1, 'cancelled', 'sdfgsdsf, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '79077223527', '2025-06-21 09:59:12', '2025-06-22 06:00:01'),
(10, 4, 3, 3, 'cancelled', 'sdfgsdsf, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '79077223527', '2025-06-21 09:59:12', '2025-06-22 05:57:20'),
(11, 4, 5, 3, 'cancelled', 'sdfgsdsf, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '79077223527', '2025-06-21 09:59:12', '2025-06-21 10:02:02'),
(13, 4, 1, 1, 'cancelled', 'ff, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '7907223527', '2025-06-22 15:55:34', '2025-07-03 14:31:28'),
(14, 4, 5, 3, 'cancelled', 'wr3, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '7907223527', '2025-06-22 05:53:42', '2025-06-22 05:57:19'),
(15, 4, 5, 3, 'cancelled', 'hhh, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683563', '7907223527', '2025-06-22 05:56:34', '2025-06-22 05:57:33'),
(16, 4, 5, 12, 'cancelled', 'ff, Kalarikkanjalil (H) Nad P.O Vidakuzha\nPIPE LINE ROAD, 683563', '7907223527', '2025-06-22 06:02:14', '2025-06-22 06:03:33'),
(17, 4, 2, 1, 'shipped', 'kochi, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '7907882574', '2025-06-22 09:10:36', '2025-07-28 10:28:56'),
(19, 4, 1, 1, 'delivered', 'kochi, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683563', '7907332527', '2025-06-24 11:16:31', '2025-07-26 06:02:37'),
(20, 4, 1, 3, 'shipped', 'Kalamassery, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '8593909162', '2025-07-03 14:34:03', '2025-07-28 10:28:55'),
(21, 4, 5, 1, 'shipped', 'Kalamassery, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '8593909162', '2025-07-03 14:34:03', '2025-07-28 10:28:54'),
(22, 4, 4, 1, 'shipped', 'Kalamassery, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '8593909162', '2025-07-03 14:34:03', '2025-07-28 10:28:53'),
(23, 4, 3, 1, 'shipped', 'Kalamassery, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '8593909162', '2025-07-03 14:34:03', '2025-07-28 10:28:51'),
(24, 4, 1, 3, 'shipped', 'Kalamassery, Kalarikkanjalil (H) Nad P.O Vidakuzha, 683104', '8593909162', '2025-07-14 09:05:06', '2025-07-28 10:28:50'),
(25, 4, 2, 1, 'ordered', 'Ernakulam, Kalarikkanjalil (H) Nad P.O Vidakuzha\nPIPE LINE ROAD, 683563', '7907223527', '2025-07-28 10:28:13', '2025-07-28 10:28:13');

-- --------------------------------------------------------

--
-- Table structure for table `custom_requests`
--

DROP TABLE IF EXISTS `custom_requests`;
CREATE TABLE IF NOT EXISTS `custom_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `service_type` varchar(50) DEFAULT NULL,
  `pest_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `custom_requests`
--

INSERT INTO `custom_requests` (`id`, `user_id`, `description`, `latitude`, `longitude`, `phone`, `status`, `service_type`, `pest_type`, `created_at`, `price`) VALUES
(1, 4, NULL, '10.0682476', '76.3422271', '8593909162', 'pending', NULL, NULL, '2025-06-15 20:29:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_type` enum('admin','user','technician') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `is_seen` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_type`, `message`, `created_at`, `user_id`, `is_seen`) VALUES
(1, 'admin', 'Inventory low for product: Mosquito Electric Racket (Remaining: 5)', '2025-05-15 11:41:25', NULL, 0),
(2, 'admin', 'Inventory low for product: Beetle Repellent Powder (Remaining: 3)', '2025-05-15 11:59:18', NULL, 0),
(30, 'admin', 'New booking #27 for service: Rodent Control', '2025-05-30 16:05:04', NULL, 0),
(31, 'user', 'Your booking #27 is confirmed for Saturday, May 31 at 9:00 AM', '2025-05-30 16:05:04', 4, 1),
(32, 'admin', 'New booking #28 for service: Rodent Control', '2025-06-01 16:01:53', NULL, 0),
(33, 'user', 'Your booking #28 is confirmed for Thursday, June 12 at 11:00 AM', '2025-06-01 16:01:53', 4, 1),
(34, 'admin', 'New booking #29 for service: Carpet Cleaning', '2025-06-02 14:42:20', NULL, 0),
(35, 'user', 'Your booking #29 is confirmed for Thursday, June 5 at 4:30 PM', '2025-06-02 14:42:20', 4, 1),
(38, 'admin', 'New booking #31 for service: Rodent Control', '2025-06-02 14:54:37', NULL, 0),
(39, 'user', 'Your booking #31 is confirmed for Thursday, June 12 at 4:30 PM', '2025-06-02 14:54:37', 4, 1),
(44, 'admin', 'New booking #34 for service: Home Inspection', '2025-06-02 15:04:54', NULL, 0),
(45, 'user', 'Your booking #34 is confirmed for Friday, June 27 at 10:30 AM', '2025-06-02 15:04:54', 4, 1),
(46, 'admin', 'New booking #35 for service: Rodent Control', '2025-06-02 15:16:15', NULL, 0),
(47, 'user', 'Your booking #35 is confirmed for Friday, June 27 at 4:00 PM', '2025-06-02 15:16:15', 4, 1),
(48, 'admin', 'New booking #36 for service: Rodent Control', '2025-06-02 15:18:47', NULL, 0),
(49, 'user', 'Your booking #36 is confirmed for Friday, June 27 at 4:00 PM', '2025-06-02 15:18:47', 4, 1),
(50, 'admin', 'New booking #37 for service: Rodent Control', '2025-06-02 15:32:40', NULL, 0),
(51, 'user', 'Your booking #37 is confirmed for Tuesday, June 10 at 5:00 PM', '2025-06-02 15:32:40', 4, 1),
(52, 'admin', 'New booking #38 for service: Rodent Control', '2025-06-02 15:33:51', NULL, 0),
(53, 'user', 'Your booking #38 is confirmed for Thursday, June 19 at 9:00 AM', '2025-06-02 15:33:51', 4, 1),
(54, 'admin', 'New booking #39 for service: Rodent Control', '2025-06-02 15:34:32', NULL, 0),
(55, 'user', 'Your booking #39 is confirmed for Friday, June 27 at 4:30 PM', '2025-06-02 15:34:32', 4, 1),
(56, 'admin', 'New booking #40 for service: Rodent Control', '2025-06-02 15:35:47', NULL, 0),
(57, 'user', 'Your booking #40 is confirmed for Friday, July 4 at 1:00 PM', '2025-06-02 15:35:47', 4, 1),
(58, 'admin', 'New booking #41 for service: Rodent Control', '2025-06-02 15:36:31', NULL, 0),
(59, 'user', 'Your booking #41 is confirmed for Thursday, June 12 at 9:00 AM', '2025-06-02 15:36:31', 4, 1),
(60, 'admin', 'New booking #42 for service: Home Inspection', '2025-06-02 15:38:00', NULL, 0),
(61, 'user', 'Your booking #42 is confirmed for Wednesday, June 4 at 9:00 AM', '2025-06-02 15:38:00', 4, 1),
(62, 'admin', 'New booking #43 for service: Home Inspection', '2025-06-02 15:38:42', NULL, 0),
(63, 'user', 'Your booking #43 is confirmed for Saturday, June 21 at 9:00 AM', '2025-06-02 15:38:42', 4, 1),
(64, 'admin', 'New booking #44 for service: Home Inspection', '2025-06-09 14:56:24', NULL, 0),
(65, 'user', 'Your booking #44 is confirmed for Wednesday, June 18 at 9:00 AM', '2025-06-09 14:56:24', 4, 1),
(66, 'admin', 'New booking #45 for service: Home Inspection', '2025-06-09 14:56:54', NULL, 0),
(67, 'user', 'Your booking #45 is confirmed for Friday, June 20 at 9:00 AM', '2025-06-09 14:56:54', 4, 1),
(68, 'admin', 'New booking #46 for service: Carpet Cleaning', '2025-06-09 14:57:18', NULL, 0),
(69, 'user', 'Your booking #46 is confirmed for Saturday, July 12 at 4:30 PM', '2025-06-09 14:57:18', 4, 1),
(70, 'admin', 'New booking #47 for service: Rodent Control', '2025-06-10 17:28:14', NULL, 0),
(71, 'user', 'Your booking #47 is confirmed for Thursday, June 19 at 9:00 AM', '2025-06-10 17:28:14', 7, 0),
(72, 'admin', 'New booking #48 for service: Home Inspection', '2025-06-16 16:11:59', NULL, 0),
(73, 'user', 'Your booking #48 is confirmed for Tuesday, June 17 at 5:00 PM', '2025-06-16 16:11:59', 4, 1),
(74, 'technician', 'You have been assigned a new service: Home Inspection on Tuesday, June 17 at 5:00 PM', '2025-06-16 16:11:59', 5, 1),
(75, 'admin', 'New booking #49 for service: Home Inspection', '2025-06-16 16:14:17', NULL, 0),
(76, 'user', 'Your booking #49 is confirmed for Tuesday, June 17 at 9:00 AM', '2025-06-16 16:14:17', 4, 1),
(77, 'technician', 'You have been assigned a new service: Home Inspection on Tuesday, June 17 at 9:00 AM', '2025-06-16 16:14:17', 5, 1),
(78, 'admin', 'New booking #50 for service: Home Inspection', '2025-06-17 13:20:42', NULL, 0),
(79, 'user', 'Your booking #50 is confirmed for Thursday, June 19 at 10:30 AM', '2025-06-17 13:20:42', 4, 1),
(80, 'technician', 'You have been assigned a new service: Home Inspection on Thursday, June 19 at 10:30 AM', '2025-06-17 13:20:42', 5, 1),
(81, 'user', 'Your OTP for booking #27 has been updated. Please verify within 5 minutes.', '2025-06-17 15:50:13', 4, 1),
(82, 'user', 'Your OTP for booking #27 is 554734. Please verify within 5 minutes.', '2025-06-18 15:52:16', 4, 1),
(83, 'technician', 'Your leave from 19-Jun-2025 to 19-Jun-2025 was REJECTED.', '2025-06-18 16:50:20', 5, 0),
(84, 'technician', 'Your leave request has been rejected by admin.', '2025-06-18 16:50:20', 5, 0),
(85, 'technician', 'Your leave from 20-Jun-2025 to 21-Jun-2025 was REJECTED.', '2025-06-18 16:50:28', 5, 1),
(86, 'technician', 'Your leave request has been rejected by admin.', '2025-06-18 16:50:28', 5, 0),
(89, 'admin', 'New booking #52 for service: Carpet Cleaning', '2025-06-18 17:04:41', NULL, 0),
(90, 'user', 'Your booking #52 is confirmed for Thursday, June 19 at 9:00 AM', '2025-06-18 17:04:41', 4, 1),
(91, 'technician', 'You have been assigned a new service: Carpet Cleaning on Thursday, June 19 at 9:00 AM', '2025-06-18 17:04:41', 5, 0),
(92, 'admin', 'Inventory low for product: Beetle Repellent Powder (Remaining: 0)', '2025-06-22 05:56:34', NULL, 0),
(93, 'admin', 'New booking #53 for service: Home Inspection', '2025-06-22 09:04:37', NULL, 0),
(94, 'user', 'Your booking #53 is confirmed for Monday, June 23 at 9:00 AM', '2025-06-22 09:04:37', 4, 1),
(95, 'technician', 'You have been assigned a new service: Home Inspection on Monday, June 23 at 9:00 AM', '2025-06-22 09:04:38', 5, 0),
(96, 'admin', 'New booking #54 for service: Home Inspection', '2025-06-24 11:20:13', NULL, 0),
(97, 'user', 'Your booking #54 is confirmed for Wednesday, June 25 at 10:00 AM', '2025-06-24 11:20:13', 4, 1),
(98, 'technician', 'You have been assigned a new service: Home Inspection on Wednesday, June 25 at 10:00 AM', '2025-06-24 11:20:13', 5, 0),
(99, 'admin', 'New booking #55 for service: Home Inspection', '2025-06-29 19:55:51', NULL, 0),
(100, 'user', 'Your booking #55 is confirmed for Thursday, July 3 at 9:00 AM', '2025-06-29 19:55:51', 4, 1),
(101, 'technician', 'You have been assigned a new service: Home Inspection on Thursday, July 3 at 9:00 AM', '2025-06-29 19:55:51', 5, 0),
(102, 'admin', 'New booking #56 for service: Carpet Cleaning', '2025-07-01 16:38:21', NULL, 0),
(103, 'user', 'Your booking #56 is confirmed for Thursday, July 10 at 10:30 AM', '2025-07-01 16:38:21', 4, 1),
(104, 'technician', 'You have been assigned a new service: Carpet Cleaning on Thursday, July 10 at 10:30 AM', '2025-07-01 16:38:21', 5, 0),
(105, 'admin', 'New booking #57 for service: Carpet Cleaning', '2025-07-01 16:39:07', NULL, 0),
(106, 'user', 'Your booking #57 is confirmed for Friday, July 11 at 5:00 PM', '2025-07-01 16:39:07', 4, 0),
(107, 'technician', 'You have been assigned a new service: Carpet Cleaning on Friday, July 11 at 5:00 PM', '2025-07-01 16:39:07', 6, 0),
(108, 'admin', 'New booking #58 for service: Home Inspection', '2025-07-03 14:27:16', NULL, 0),
(109, 'user', 'Your booking #58 is confirmed for Wednesday, July 30 at 9:00 AM', '2025-07-03 14:27:16', 4, 0),
(110, 'technician', 'You have been assigned a new service: Home Inspection on Wednesday, July 30 at 9:00 AM', '2025-07-03 14:27:16', 5, 0),
(111, 'admin', 'New booking #59 for service: Home Inspection', '2025-07-04 07:10:08', NULL, 0),
(112, 'user', 'Your booking #59 is confirmed for Thursday, July 17 at 9:00 AM', '2025-07-04 07:10:08', 4, 0),
(113, 'technician', 'You have been assigned a new service: Home Inspection on Thursday, July 17 at 9:00 AM', '2025-07-04 07:10:08', 6, 0),
(114, 'user', 'Your OTP for booking #54 is 980633. Please verify within 5 minutes.', '2025-07-04 07:12:36', 4, 0),
(115, 'technician', 'Your leave from 05-Jul-2025 to 07-Jul-2025 was REJECTED.', '2025-07-04 14:28:50', 5, 0),
(116, 'technician', 'Your leave request has been rejected by admin.', '2025-07-04 14:28:50', 5, 0),
(117, 'admin', 'New booking #60 for service: Bed Bug Extermination', '2025-07-14 09:02:24', NULL, 0),
(118, 'user', 'Your booking #60 is confirmed for Wednesday, July 23 at 12:00 PM', '2025-07-14 09:02:24', 4, 0),
(119, 'technician', 'You have been assigned a new service: Bed Bug Extermination on Wednesday, July 23 at 12:00 PM', '2025-07-14 09:02:24', 6, 0),
(120, 'technician', 'You have been assigned a new service: Bed Bug Extermination on Wednesday, July 23 at 12:00 PM', '2025-07-14 09:02:24', 5, 0),
(129, 'user', 'Your OTP for booking #53 is 852113. Please verify within 5 minutes.', '2025-07-28 07:28:31', 4, 0),
(130, 'admin', 'Your service (Booking ID: 28) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(131, 'admin', 'Your service (Booking ID: 31) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(132, 'admin', 'Your service (Booking ID: 34) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(133, 'admin', 'Your service (Booking ID: 42) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(134, 'admin', 'Your service (Booking ID: 43) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(135, 'admin', 'Your service (Booking ID: 44) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(136, 'admin', 'Your service (Booking ID: 45) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(137, 'admin', 'Your service (Booking ID: 46) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(138, 'admin', 'Your service (Booking ID: 47) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 7, 0),
(139, 'admin', 'Your service (Booking ID: 49) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(140, 'admin', 'Your service (Booking ID: 50) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(141, 'admin', 'Your service (Booking ID: 52) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(142, 'admin', 'Your service (Booking ID: 53) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(143, 'admin', 'Your service (Booking ID: 55) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(144, 'admin', 'Your service (Booking ID: 56) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(145, 'admin', 'Your service (Booking ID: 57) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(146, 'admin', 'Your service (Booking ID: 59) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 0),
(147, 'user', 'Your service (Booking ID: 60) was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.', '2025-07-28 10:02:10', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `booking_id` int NOT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `otp_verifications`
--

INSERT INTO `otp_verifications` (`booking_id`, `otp`, `expires_at`, `verified`) VALUES
(27, '554734', '2025-06-18 15:57:17', 1),
(48, '469283', '2025-06-17 15:04:42', 1),
(53, '914796', '2025-07-28 09:00:19', 0),
(54, '980633', '2025-07-04 07:17:36', 1);

--
-- Triggers `otp_verifications`
--
DROP TRIGGER IF EXISTS `trg_otp_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_otp_after_update` AFTER INSERT ON `otp_verifications` FOR EACH ROW BEGIN
    DECLARE v_user_id INT;

    -- Get the user ID from the bookings table
    SELECT b.user_id INTO v_user_id
    FROM bookings b
    WHERE b.booking_id = NEW.booking_id;

    -- If a matching user is found, insert a notification with the OTP
    IF v_user_id IS NOT NULL THEN
        INSERT INTO notifications (
            user_type,
            message,
            created_at,
            user_id,
            is_seen
        ) VALUES (
            'user',
            CONCAT(
                'Your OTP for booking #', NEW.booking_id, 
                ' is ', NEW.otp, 
                '. Please verify within 5 minutes.'
            ),
            NOW(),
            v_user_id,
            0
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `razorpay_payment_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `booking_id`, `razorpay_payment_id`, `amount`, `status`, `created_at`) VALUES
(1, 27, 'pay_QcjRncXAUwaGbj', '1500.00', 'success', '2025-06-03 13:00:41'),
(2, 28, 'pay_QcjYzfro769jar', '1500.00', 'success', '2025-06-03 13:07:29'),
(3, 47, 'pay_QfZkmAz6eCABgF', '1500.00', 'success', '2025-06-10 17:28:41'),
(4, 48, 'pay_Qhvf1zY7lmI5vN', '500.00', 'success', '2025-06-16 16:12:47'),
(5, 49, 'pay_Qhvi1HmvTN8jb7', '500.00', 'success', '2025-06-16 16:15:38'),
(6, 31, 'pay_Qhw6EIrZ8hHqIp', '1500.00', 'success', '2025-06-16 16:38:16'),
(7, 50, 'pay_QiHH9BYZt8E2Uk', '500.00', 'success', '2025-06-17 13:21:10'),
(8, 53, 'pay_QkBbtUOgs2kxdk', '500.00', 'success', '2025-06-22 09:06:41'),
(9, 54, 'pay_Ql0xYCqgkpV8Yh', '500.00', 'success', '2025-06-24 11:20:40'),
(10, 55, 'pay_Qn8PsWTQSVpFOH', '500.00', 'success', '2025-06-29 19:56:14'),
(11, 58, 'pay_QocxPPgIe9ngJN', '500.00', 'success', '2025-07-03 14:27:47'),
(12, 59, 'pay_Qou2i9LiRzw51q', '500.00', 'success', '2025-07-04 07:10:35'),
(13, 60, 'pay_QstIcrxotuD0Y9', '4000.01', 'success', '2025-07-14 09:02:57');

-- --------------------------------------------------------

--
-- Table structure for table `salary`
--

DROP TABLE IF EXISTS `salary`;
CREATE TABLE IF NOT EXISTS `salary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `technician_id` int NOT NULL,
  `date` datetime NOT NULL,
  `salary` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `salary`
--

INSERT INTO `salary` (`id`, `technician_id`, `date`, `salary`) VALUES
(1, 5, '2025-07-28 14:45:11', 12000),
(2, 6, '2025-07-28 14:45:11', 3000),
(4, 5, '2025-07-28 14:46:11', 12000),
(5, 6, '2025-07-28 14:46:11', 3000);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `service_type` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `technicians_needed` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `duration_minutes` int DEFAULT '60',
  `pest_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `service_type`, `category`, `name`, `technicians_needed`, `price`, `description`, `duration_minutes`, `pest_type`) VALUES
(7, 'Home Service', 'General', 'Home Inspection', 1, '500.00', 'Basic home inspection for general issues.', 60, 'Other'),
(8, 'Home Service', 'Pest Control', 'Rodent Control', 2, '1500.00', 'Rodent control service for homes.', 60, 'Rodent'),
(9, 'Industrial Service', 'Pest Control', 'Fungus Treatment', 2, '2800.00', 'Fungal growth removal and preventive measures.', 60, 'Fungus'),
(10, 'Home Service', 'Cleaning', 'Carpet Cleaning', 1, '800.00', 'Professional carpet cleaning for residential homes.', 60, 'Other'),
(11, 'Industrial Service', 'Pest Control', 'Rodent Extermination', 4, '4500.00', 'Rodent extermination service for factories and warehouses.', 60, NULL),
(13, 'Industrial Service', 'General', 'HVAC Maintenance', 5, '6000.00', 'Heating, ventilation, and air conditioning system maintenance.', 60, NULL),
(14, 'Home Service', 'Electrical', 'Generator Repair', 2, '1500.00', 'Repair and maintenance of home generators.', 60, NULL),
(16, 'Home Service', 'Pest Control', 'Ant Control', 2, '1200.00', 'Home ant infestation treatment and prevention.', 60, 'Insect'),
(23, 'Home Service', 'Pest Control', 'Rat Killer', 1, '4000.00', 'Killer Rats please', 60, 'Other'),
(24, 'Industrial Service', 'Pest Control', 'Bed Bug Extermination', 2, '4000.00', 'KIll BEdBUgs', 80, 'Insect'),
(25, 'Weekly Service', 'Complete Maintenance', 'Weekly Cokroach Maintenance', 3, '6500.00', 'Weekly cokcroach Maintenance', 240, 'cokcroach');

-- --------------------------------------------------------

--
-- Table structure for table `store`
--

DROP TABLE IF EXISTS `store`;
CREATE TABLE IF NOT EXISTS `store` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `image_path` text,
  `inventory_amount` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `store`
--

INSERT INTO `store` (`id`, `name`, `description`, `price`, `category`, `image_path`, `inventory_amount`) VALUES
(1, 'Cockroach Gel Bait', 'Effective gel bait for killing cockroaches in kitchens and bathrooms.', '249.00', 'normal', 'Screenshot_2024-03-06_211315.png', 104),
(2, 'Ant Killer Spray', 'Instant kill spray for ants and crawling insects.', '199.00', 'normal', 'Screenshot_2024-10-25_102052.png', 100),
(3, 'Rodent Glue Trap', 'Non-toxic glue trap for capturing rats and mice.', '149.00', 'normal', 'Screenshot_2024-10-13_170407.png', 200),
(4, 'Mosquito Electric Racket', 'Rechargeable electric mosquito swatter racket.', '499.00', 'normal', 'Screenshot_2024-02-27_133121.png', 5),
(5, 'Beetle Repellent Powder', 'Natural beetle repellent powder for gardens.', '349.00', 'normal', 'https://example.com/images/beetle-powder.jpg', 120),
(7, 'Ant Killer Spray', 'Instant kill spray for ants and crawling insects.', '199.00', 'normal', 'https://example.com/images/ant-spray.jpg', 0),
(11, 'Product 1', 'Description of product 1', '100.00', 'normal', NULL, 0),
(12, 'Product 2', 'Description of product 2', '150.00', 'normal', NULL, 0),
(13, 'Product 3', 'Description of product 3', '200.00', 'normal', NULL, 0),
(14, 'Product 4', 'Description of product 4', '250.00', 'normal', NULL, 0),
(15, 'Product 5', 'Description of product 5', '300.00', 'normal', NULL, 0),
(16, 'Sustainable Product 1', 'Description of sustainable product 1', '120.00', 'sustainable', NULL, 0),
(17, 'Sustainable Product 2', 'Description of sustainable product 2', '180.00', 'sustainable', NULL, 0),
(18, 'Sustainable Product 3', 'Description of sustainable product 3', '220.00', 'sustainable', NULL, 0),
(19, 'Sustainable Product 4', 'Description of sustainable product 4', '270.00', 'sustainable', NULL, 0),
(20, 'Sustainable Product 5', 'Description of sustainable product 5', '350.00', 'sustainable', NULL, 0),
(21, 'appu', 'very good thing', '5.55', 'normal', 'Screenshot_2024-02-27_132938.png', 300),
(24, 'scms', 'wow', '5.55', 'Sustainable', 'Screenshot_2024-10-13_164928.png', 45),
(26, 'yayaya', 'hello nice', '0.00', 'Sustainable', NULL, 0);

--
-- Triggers `store`
--
DROP TRIGGER IF EXISTS `notify_low_inventory`;
DELIMITER $$
CREATE TRIGGER `notify_low_inventory` AFTER UPDATE ON `store` FOR EACH ROW BEGIN
    IF NEW.inventory_amount < 10 AND NEW.inventory_amount <> OLD.inventory_amount THEN
        INSERT INTO notifications (user_type, message)
        VALUES (
            'admin', 
            CONCAT('Inventory low for product: ', NEW.name, ' (Remaining: ', NEW.inventory_amount, ')')
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `technicians`
--

DROP TABLE IF EXISTS `technicians`;
CREATE TABLE IF NOT EXISTS `technicians` (
  `technician_id` int NOT NULL,
  `skills` text,
  `experience_years` int DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `last_job` datetime DEFAULT NULL,
  PRIMARY KEY (`technician_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `technicians`
--

INSERT INTO `technicians` (`technician_id`, `skills`, `experience_years`, `salary`, `last_job`) VALUES
(5, 'killer of rat', 3, '12000.00', '2025-07-14 09:02:24'),
(6, 'rat', 2, '3000.00', '2025-07-14 09:02:24');

-- --------------------------------------------------------

--
-- Table structure for table `technician_unavailable`
--

DROP TABLE IF EXISTS `technician_unavailable`;
CREATE TABLE IF NOT EXISTS `technician_unavailable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `technician_id` int NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `technician_id` (`technician_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `technician_unavailable`
--

INSERT INTO `technician_unavailable` (`id`, `technician_id`, `start_datetime`, `end_datetime`, `reason`, `created_at`, `status`) VALUES
(3, 5, '2025-06-19 09:00:00', '2025-06-20 09:00:00', 'job', '2025-06-18 17:04:41', 'approved'),
(4, 5, '2025-06-23 09:00:00', '2025-06-24 09:00:00', 'job', '2025-06-22 09:04:38', 'approved'),
(5, 5, '2025-06-25 10:00:00', '2025-06-26 10:00:00', 'job', '2025-06-24 11:20:13', 'approved'),
(6, 5, '2025-07-03 09:00:00', '2025-07-04 09:00:00', 'job', '2025-06-29 19:55:51', 'approved'),
(7, 5, '2025-07-10 10:30:00', '2025-07-11 10:30:00', 'job', '2025-07-01 16:38:21', 'approved'),
(8, 6, '2025-07-11 17:00:00', '2025-07-12 17:00:00', 'job', '2025-07-01 16:39:07', 'approved'),
(9, 5, '2025-07-30 09:00:00', '2025-07-31 09:00:00', 'job', '2025-07-03 14:27:16', 'approved'),
(10, 6, '2025-07-17 09:00:00', '2025-07-18 09:00:00', 'job', '2025-07-04 07:10:09', 'approved'),
(11, 5, '2025-07-05 00:00:00', '2025-07-07 00:00:00', 'Fever', '2025-07-04 14:28:35', 'rejected'),
(12, 5, '2025-07-19 00:00:00', '2025-07-19 00:00:00', 'Fever', '2025-07-04 14:47:30', 'pending'),
(13, 6, '2025-07-23 12:00:00', '2025-07-24 12:00:00', 'job', '2025-07-14 09:02:24', 'approved'),
(14, 5, '2025-07-23 12:00:00', '2025-07-24 12:00:00', 'job', '2025-07-14 09:02:24', 'approved');

--
-- Triggers `technician_unavailable`
--
DROP TRIGGER IF EXISTS `after_leave_status_update`;
DELIMITER $$
CREATE TRIGGER `after_leave_status_update` AFTER UPDATE ON `technician_unavailable` FOR EACH ROW BEGIN
    -- Only trigger if status changed
    IF OLD.status <> NEW.status THEN
        INSERT INTO notifications (user_id, user_type, message, created_at, is_seen)
        VALUES (
            NEW.technician_id,
            'technician',
            CONCAT('Your leave from ', DATE_FORMAT(NEW.start_datetime, '%d-%b-%Y'), ' to ', DATE_FORMAT(NEW.end_datetime, '%d-%b-%Y'), ' was ', UPPER(NEW.status), '.'),
            NOW(),
            FALSE
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','technician') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(50) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(50) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`, `name`, `phone`, `email`, `status`) VALUES
(3, 'admin', 'admin', 'admin', '2025-05-10 12:58:26', 'rohith', '7907223537', 'aabbsa@gmail.com', 'active'),
(4, 'root', 'hello', 'user', '2025-05-12 17:48:28', 'Rohith Raj', '8593909162', 'anaausa@gmail.com', 'active'),
(5, 'misterTech', 'yo', 'technician', '2025-05-14 09:51:58', 'misterTech', '2222222222', 'achukannan174@gmail.com', 'active'),
(6, 'akshay ms', 'aa', 'technician', '2025-05-30 07:45:37', 'Rohith Raj', '2222222223', 'appu@gmail', 'active'),
(7, 'appukuttan', 'ye', 'user', '2025-06-10 17:23:18', 'appukuttan', '1231231234', 'achukannan1sd74@gmail.com', 'active');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_technicians`
--
ALTER TABLE `booking_technicians`
  ADD CONSTRAINT `booking_technicians_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_technicians_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `store` (`id`);

--
-- Constraints for table `custom_requests`
--
ALTER TABLE `custom_requests`
  ADD CONSTRAINT `custom_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD CONSTRAINT `otp_verifications_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `technicians`
--
ALTER TABLE `technicians`
  ADD CONSTRAINT `fk_technician_user` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `technician_unavailable`
--
ALTER TABLE `technician_unavailable`
  ADD CONSTRAINT `technician_unavailable_ibfk_1` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Events
--
DROP EVENT IF EXISTS `mark_shipped_as_delivered`$$
CREATE DEFINER=`root`@`localhost` EVENT `mark_shipped_as_delivered` ON SCHEDULE EVERY 1 DAY STARTS '2025-07-22 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
  UPDATE cart
  SET status = 'delivered'
  WHERE status = 'shipped';
END$$

DROP EVENT IF EXISTS `auto_cancel_unpaid_bookings`$$
CREATE DEFINER=`root`@`localhost` EVENT `auto_cancel_unpaid_bookings` ON SCHEDULE EVERY 1 DAY STARTS '2025-07-28 13:05:58' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    UPDATE bookings b
    LEFT JOIN payments p ON b.booking_id = p.booking_id AND p.status = 'success'
    SET b.status = 'cancelled'
    WHERE b.status = 'pending'
      AND p.payment_id IS NULL
      AND b.booking_date < CURDATE();
END$$

DROP EVENT IF EXISTS `add_monthly_technician_salaries`$$
CREATE DEFINER=`root`@`localhost` EVENT `add_monthly_technician_salaries` ON SCHEDULE EVERY 1 DAY STARTS '2025-07-28 14:44:11' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
  INSERT INTO salary (technician_id, date, salary)
  SELECT technician_id, NOW(), FLOOR(salary)
  FROM technicians
  WHERE salary IS NOT NULL;
END$$

DROP EVENT IF EXISTS `auto_cancel_expired_bookings`$$
CREATE DEFINER=`root`@`localhost` EVENT `auto_cancel_expired_bookings` ON SCHEDULE EVERY 1 DAY STARTS '2025-07-28 15:32:10' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    -- Cancel confirmed bookings that are past their booking date
    UPDATE bookings
    SET status = 'cancelled'
    WHERE status = 'confirmed'
      AND booking_date < CURDATE();

    -- Insert notifications for affected users
    INSERT INTO notifications (user_type,user_id, message, created_at)
    SELECT "user", b.user_id,
           CONCAT('Your service (Booking ID: ', b.booking_id, ') was cancelled because the scheduled date has passed. Any paid amount is being processed for debit.'),
           NOW()
    FROM bookings b
    WHERE b.status = 'cancelled'
      AND b.booking_date < CURDATE()
      AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = b.user_id
            AND n.message LIKE CONCAT('%Booking ID: ', b.booking_id, '%')
            AND DATE(n.created_at) = CURDATE()
      );
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
