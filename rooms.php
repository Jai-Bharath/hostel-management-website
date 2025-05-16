<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/db_config.php';

// Get all rooms
function getRooms() {
    global $conn;
    $sql = "SELECT * FROM rooms ORDER BY room_number ASC";
    
    $result = $conn->query($sql);
    $rooms = [];
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $rooms[] = [
                'id' => $row['id'],
                'roomNumber' => $row['room_number'],
                'roomType' => $row['room_type'],
                'floor' => $row['floor'],
                'capacity' => $row['capacity'],
                'pricePerMonth' => $row['price_per_month'],
                'status' => $row['status']
            ];
        }
    }
    
    echo json_encode(['success' => true, 'data' => $rooms]);
}

// Add new room
function addRoom() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if room number already exists
    $check_sql = "SELECT id FROM rooms WHERE room_number = ?";
    $stmt = $conn->prepare($check_sql);
    $stmt->bind_param("s", $data['roomNumber']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Room number already exists']);
        return;
    }
    
    $sql = "INSERT INTO rooms (room_number, room_type, floor, capacity, price_per_month, status) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiids", 
        $data['roomNumber'],
        $data['roomType'],
        $data['floor'],
        $data['capacity'],
        $data['pricePerMonth'],
        $data['status']
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding room']);
    }
}

// Update room
function updateRoom($id) {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if room number exists (excluding current room)
    $check_sql = "SELECT id FROM rooms WHERE room_number = ? AND id != ?";
    $stmt = $conn->prepare($check_sql);
    $stmt->bind_param("si", $data['roomNumber'], $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Room number already exists']);
        return;
    }
    
    $sql = "UPDATE rooms SET 
            room_number = ?, 
            room_type = ?, 
            floor = ?, 
            capacity = ?, 
            price_per_month = ?, 
            status = ? 
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiidsi", 
        $data['roomNumber'],
        $data['roomType'],
        $data['floor'],
        $data['capacity'],
        $data['pricePerMonth'],
        $data['status'],
        $id
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating room']);
    }
}

// Delete room
function deleteRoom($id) {
    global $conn;
    
    // Check if room is occupied
    $check_sql = "SELECT status FROM rooms WHERE id = ?";
    $stmt = $conn->prepare($check_sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $room = $result->fetch_assoc();
    
    if ($room['status'] === 'Occupied') {
        echo json_encode(['success' => false, 'message' => 'Cannot delete occupied room']);
        return;
    }
    
    $sql = "DELETE FROM rooms WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting room']);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        getRooms();
        break;
    case 'POST':
        addRoom();
        break;
    case 'PUT':
        if ($id) {
            updateRoom($id);
        }
        break;
    case 'DELETE':
        if ($id) {
            deleteRoom($id);
        }
        break;
}

$conn->close();
?> 