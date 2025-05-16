<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/db_config.php';

// Get all students
function getStudents() {
    global $conn;
    $sql = "SELECT * FROM students ORDER BY created_at DESC";
    
    $result = $conn->query($sql);
    $students = [];
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $students[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'roomType' => $row['room_type'],
                'roomNumber' => $row['room_number'],
                'checkInDate' => $row['check_in_date'],
                'status' => $row['status']
            ];
        }
    }
    
    echo json_encode(['success' => true, 'data' => $students]);
}

// Add new student
function addStudent() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    $sql = "INSERT INTO students (name, email, phone, room_type, room_number, check_in_date, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssss", 
        $data['name'],
        $data['email'],
        $data['phone'],
        $data['roomType'],
        $data['roomNumber'],
        $data['checkInDate'],
        $data['status']
    );
    
    if ($stmt->execute()) {
        // Update room status to Occupied
        $update_room = "UPDATE rooms SET status = 'Occupied' WHERE room_number = ?";
        $stmt = $conn->prepare($update_room);
        $stmt->bind_param("s", $data['roomNumber']);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Student added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding student']);
    }
}

// Update student
function updateStudent($id) {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get current room number
    $get_current = "SELECT room_number FROM students WHERE id = ?";
    $stmt = $conn->prepare($get_current);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $current = $result->fetch_assoc();
    
    // Update student
    $sql = "UPDATE students SET 
            name = ?, 
            email = ?, 
            phone = ?, 
            room_type = ?, 
            room_number = ?, 
            check_in_date = ?, 
            status = ? 
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssi", 
        $data['name'],
        $data['email'],
        $data['phone'],
        $data['roomType'],
        $data['roomNumber'],
        $data['checkInDate'],
        $data['status'],
        $id
    );
    
    if ($stmt->execute()) {
        // Update old room to Available
        if ($current['room_number'] !== $data['roomNumber']) {
            $update_old = "UPDATE rooms SET status = 'Available' WHERE room_number = ?";
            $stmt = $conn->prepare($update_old);
            $stmt->bind_param("s", $current['room_number']);
            $stmt->execute();
            
            // Update new room to Occupied
            $update_new = "UPDATE rooms SET status = 'Occupied' WHERE room_number = ?";
            $stmt = $conn->prepare($update_new);
            $stmt->bind_param("s", $data['roomNumber']);
            $stmt->execute();
        }
        
        echo json_encode(['success' => true, 'message' => 'Student updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating student']);
    }
}

// Delete student
function deleteStudent($id) {
    global $conn;
    
    // Get room number before deleting
    $get_room = "SELECT room_number FROM students WHERE id = ?";
    $stmt = $conn->prepare($get_room);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $room = $result->fetch_assoc();
    
    // Delete student
    $sql = "DELETE FROM students WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        // Update room status to Available
        $update_room = "UPDATE rooms SET status = 'Available' WHERE room_number = ?";
        $stmt = $conn->prepare($update_room);
        $stmt->bind_param("s", $room['room_number']);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Student deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting student']);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        getStudents();
        break;
    case 'POST':
        addStudent();
        break;
    case 'PUT':
        if ($id) {
            updateStudent($id);
        }
        break;
    case 'DELETE':
        if ($id) {
            deleteStudent($id);
        }
        break;
}

$conn->close();
?> 