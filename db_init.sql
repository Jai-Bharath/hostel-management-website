-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hostel_management;
USE hostel_management;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS rooms;

-- Create rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type ENUM('Single Room', 'Double Room', 'Triple Room', 'Deluxe Single', 'Studio Room') NOT NULL,
    floor INT NOT NULL,
    capacity INT NOT NULL,
    price_per_month DECIMAL(10, 2) NOT NULL,
    status ENUM('Available', 'Occupied', 'Maintenance') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    room_number VARCHAR(10),
    check_in_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'Pending') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE SET NULL
);

-- Create bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id VARCHAR(10) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    check_in_date DATE NOT NULL,
    duration_months INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    payment_status ENUM('Pending', 'Partially Paid', 'Paid', 'Refunded') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id VARCHAR(10) UNIQUE NOT NULL,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Insert sample room data
INSERT INTO rooms (room_number, room_type, floor, capacity, price_per_month, status) VALUES
('101', 'Single Room', 1, 1, 500.00, 'Available'),
('102', 'Single Room', 1, 1, 500.00, 'Available'),
('201', 'Double Room', 2, 2, 800.00, 'Available'),
('202', 'Double Room', 2, 2, 800.00, 'Available'),
('301', 'Triple Room', 3, 3, 1200.00, 'Available'),
('302', 'Deluxe Single', 3, 1, 1000.00, 'Available'),
('401', 'Studio Room', 4, 2, 1500.00, 'Available');

-- Create triggers for booking management
DELIMITER //

-- Trigger to update room status when a booking is confirmed
CREATE TRIGGER after_booking_confirmation
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'Confirmed' AND OLD.status != 'Confirmed' THEN
        UPDATE rooms SET status = 'Occupied' WHERE room_number = NEW.room_number;
    ELSEIF NEW.status = 'Cancelled' AND OLD.status = 'Confirmed' THEN
        UPDATE rooms SET status = 'Available' WHERE room_number = NEW.room_number;
    END IF;
END//

-- Trigger to update booking payment status when payment is completed
CREATE TRIGGER after_payment_completion
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        UPDATE bookings SET payment_status = 'Paid' WHERE id = NEW.booking_id;
    ELSEIF NEW.status = 'Refunded' AND OLD.status = 'Completed' THEN
        UPDATE bookings SET payment_status = 'Refunded' WHERE id = NEW.booking_id;
    END IF;
END//

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_room_status ON rooms(status);
CREATE INDEX idx_student_status ON students(status);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_booking_dates ON bookings(check_in_date, booking_date);
CREATE INDEX idx_payment_dates ON payments(payment_date); 