<?php
// Load environment variables if .env file exists
if (file_exists(__DIR__ . '/../.env')) {
    $envVars = parse_ini_file(__DIR__ . '/../.env');
    foreach ($envVars as $key => $value) {
        $_ENV[$key] = $value;
    }
}

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'hostel_management');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if ($conn->query($sql) === TRUE) {
    $conn->select_db(DB_NAME);
} else {
    die("Error creating database: " . $conn->error);
}

// Drop existing tables in reverse order to handle dependencies
$drop_tables = [
    "DROP TABLE IF EXISTS payments",
    "DROP TABLE IF EXISTS bookings",
    "DROP TABLE IF EXISTS students",
    "DROP TABLE IF EXISTS rooms"
];

foreach ($drop_tables as $drop_table) {
    if ($conn->query($drop_table) !== TRUE) {
        die("Error dropping table: " . $conn->error);
    }
}

// Create tables
$tables = [
    "CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        room_type VARCHAR(50),
        room_number VARCHAR(20),
        check_in_date DATE,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(20) UNIQUE NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        floor INT,
        capacity INT,
        price_per_month DECIMAL(10,2),
        status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(20) UNIQUE NOT NULL,
        student_id INT,
        room_id INT,
        check_in_date DATE,
        duration VARCHAR(20),
        status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
        payment_status ENUM('Pending', 'Paid', 'Partially Paid', 'Refunded') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE
    )",
    
    "CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id VARCHAR(20) UNIQUE NOT NULL,
        booking_id INT,
        amount DECIMAL(10,2),
        payment_date DATE,
        payment_method VARCHAR(50),
        status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE
    )"
];

foreach ($tables as $table) {
    if ($conn->query($table) !== TRUE) {
        die("Error creating table: " . $conn->error);
    }
}

// Return connection
return $conn;
?> 