<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/db_config.php';

// Get all payments
function getPayments() {
    global $conn;
    $sql = "SELECT p.*, b.booking_id, s.name as student_name 
            FROM payments p 
            LEFT JOIN bookings b ON p.booking_id = b.id 
            LEFT JOIN students s ON b.student_id = s.id 
            ORDER BY p.created_at DESC";
    
    $result = $conn->query($sql);
    $payments = [];
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $payments[] = [
                'id' => $row['payment_id'],
                'bookingId' => $row['booking_id'],
                'student' => $row['student_name'],
                'amount' => $row['amount'],
                'date' => $row['payment_date'],
                'method' => $row['payment_method'],
                'status' => $row['status']
            ];
        }
    }
    
    echo json_encode(['success' => true, 'data' => $payments]);
}

// Add new payment
function addPayment() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Create payment record
        $sql = "INSERT INTO payments (payment_id, booking_id, amount, payment_date, payment_method, status) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $payment_id = 'PAY' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        $stmt->bind_param("sidss", 
            $payment_id,
            $data['bookingId'],
            $data['amount'],
            $data['date'],
            $data['method'],
            $data['status']
        );
        $stmt->execute();
        
        // Update booking payment status
        if ($data['status'] === 'Completed') {
            $update_booking = "UPDATE bookings SET payment_status = 'Paid' WHERE id = ?";
            $stmt = $conn->prepare($update_booking);
            $stmt->bind_param("i", $data['bookingId']);
            $stmt->execute();
        }
        
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Payment recorded successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Error recording payment: ' . $e->getMessage()]);
    }
}

// Update payment
function updatePayment($id) {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Update payment
        $sql = "UPDATE payments SET 
                amount = ?, 
                payment_date = ?, 
                payment_method = ?, 
                status = ? 
                WHERE payment_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("dssss", 
            $data['amount'],
            $data['date'],
            $data['method'],
            $data['status'],
            $id
        );
        $stmt->execute();
        
        // Update booking payment status
        if ($data['status'] === 'Completed') {
            $update_booking = "UPDATE bookings SET payment_status = 'Paid' WHERE id = ?";
            $stmt = $conn->prepare($update_booking);
            $stmt->bind_param("i", $data['bookingId']);
            $stmt->execute();
        } else if ($data['status'] === 'Failed' || $data['status'] === 'Refunded') {
            $update_booking = "UPDATE bookings SET payment_status = 'Pending' WHERE id = ?";
            $stmt = $conn->prepare($update_booking);
            $stmt->bind_param("i", $data['bookingId']);
            $stmt->execute();
        }
        
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Payment updated successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Error updating payment: ' . $e->getMessage()]);
    }
}

// Delete payment
function deletePayment($id) {
    global $conn;
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Get booking ID before deleting
        $get_booking = "SELECT booking_id FROM payments WHERE payment_id = ?";
        $stmt = $conn->prepare($get_booking);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $payment = $result->fetch_assoc();
        
        // Delete payment
        $sql = "DELETE FROM payments WHERE payment_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        
        // Update booking payment status
        $update_booking = "UPDATE bookings SET payment_status = 'Pending' WHERE id = ?";
        $stmt = $conn->prepare($update_booking);
        $stmt->bind_param("i", $payment['booking_id']);
        $stmt->execute();
        
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Payment deleted successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Error deleting payment: ' . $e->getMessage()]);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        getPayments();
        break;
    case 'POST':
        addPayment();
        break;
    case 'PUT':
        if ($id) {
            updatePayment($id);
        }
        break;
    case 'DELETE':
        if ($id) {
            deletePayment($id);
        }
        break;
}

$conn->close();
?> 