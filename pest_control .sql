-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 28, 2025 at 12:35 PM
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
