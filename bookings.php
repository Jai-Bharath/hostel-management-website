<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/db_config.php';

// Get all bookings
function getBookings() {
    global $conn;
    $sql = "SELECT b.*, s.name as student_name, r.room_number, r.room_type 
            FROM bookings b 
            LEFT JOIN students s ON b.student_id = s.id 
            LEFT JOIN rooms r ON b.room_id = r.id 
            ORDER BY b.created_at DESC";
    
    $result = $conn->query($sql);
    $bookings = [];
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $bookings[] = [
                'id' => $row['booking_id'],
                'student' => $row['student_name'],
                'room' => $row['room_type'] . ' ' . $row['room_number'],
                'checkIn' => $row['check_in_date'],
                'duration' => $row['duration'],
                'status' => $row['status'],
                'payment' => $row['payment_status']
            ];
        }
    }
    
    echo json_encode(['success' => true, 'data' => $bookings]);
}

// Add new booking
function addBooking() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get student ID or create new student
    $student_sql = "SELECT id FROM students WHERE name = ?";
    $stmt = $conn->prepare($student_sql);
    $stmt->bind_param("s", $data['student']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $student = $result->fetch_assoc();
        $student_id = $student['id'];
    } else {
        $new_student_sql = "INSERT INTO students (name, email) VALUES (?, ?)";
        $stmt = $conn->prepare($new_student_sql);
        $email = strtolower(str_replace(' ', '.', $data['student'])) . '@example.com';
        $stmt->bind_param("ss", $data['student'], $email);
        $stmt->execute();
        $student_id = $conn->insert_id;
    }
    
    // Get room ID
    $room_parts = explode(' ', $data['room'], 2);
    $room_sql = "SELECT id FROM rooms WHERE room_type = ? AND room_number = ?";
    $stmt = $conn->prepare($room_sql);
    $stmt->bind_param("ss", $room_parts[0], $room_parts[1]);
    $stmt->execute();
    $result = $stmt->get_result();
    $room = $result->fetch_assoc();
    $room_id = $room['id'];
    
    // Create booking
    $booking_sql = "INSERT INTO bookings (booking_id, student_id, room_id, check_in_date, duration, status) 
                    VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($booking_sql);
    $booking_id = 'BK' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
    $stmt->bind_param("siisss", $booking_id, $student_id, $room_id, $data['checkIn'], $data['duration'], $data['status']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking created successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating booking']);
    }
}

// Update booking
function updateBooking($id) {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    $sql = "UPDATE bookings SET status = ? WHERE booking_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $data['status'], $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating booking']);
    }
}

// Delete booking
function deleteBooking($id) {
    global $conn;
    
    $sql = "DELETE FROM bookings WHERE booking_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Booking deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting booking']);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        getBookings();
        break;
    case 'POST':
        addBooking();
        break;
    case 'PUT':
        if ($id) {
            updateBooking($id);
        }
        break;
    case 'DELETE':
        if ($id) {
            deleteBooking($id);
        }
        break;
}

$conn->close();
?> 