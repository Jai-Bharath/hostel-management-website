// API endpoints
const API_ENDPOINTS = {
    BOOKINGS: '../api/bookings.php',
    STUDENTS: '../api/students.php',
    ROOMS: '../api/rooms.php',
    PAYMENTS: '../api/payments.php'
};

// Admin credentials (in a real application, this would be handled securely on the server)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Sample student data (in a real application, this would come from a database)
const SAMPLE_STUDENTS = [
    { id: 1, name: 'John Doe', roomType: 'Single Room', roomNumber: '101', checkInDate: '2024-03-15', status: 'Active' },
    { id: 2, name: 'Jane Smith', roomType: 'Double Room', roomNumber: '202', checkInDate: '2024-03-16', status: 'Active' },
    { id: 3, name: 'Mike Johnson', roomType: 'Deluxe Single', roomNumber: '303', checkInDate: '2024-03-17', status: 'Inactive' },
    { id: 4, name: 'Sarah Williams', roomType: 'Triple Room', roomNumber: '404', checkInDate: '2024-03-18', status: 'Active' },
    { id: 5, name: 'Tom Brown', roomType: 'Studio Room', roomNumber: '505', checkInDate: '2024-03-19', status: 'Active' }
];

// Sample bookings data (in a real application, this would come from a database)
const SAMPLE_BOOKINGS = [
    { 
        id: "BK001", 
        student: "John Doe", 
        room: "Single Room 101", 
        checkIn: "2024-03-15", 
        duration: "6 months",
        status: "Confirmed",
        payment: "Paid"
    },
    { 
        id: "BK002", 
        student: "Jane Smith", 
        room: "Double Room 202", 
        checkIn: "2024-03-20", 
        duration: "12 months",
        status: "Pending",
        payment: "Pending"
    },
    { 
        id: "BK003", 
        student: "Mike Johnson", 
        room: "Deluxe Single 303", 
        checkIn: "2024-04-01", 
        duration: "3 months",
        status: "Confirmed",
        payment: "Paid"
    },
    { 
        id: "BK004", 
        student: "Sarah Williams", 
        room: "Triple Room 404", 
        checkIn: "2024-04-05", 
        duration: "9 months",
        status: "Cancelled",
        payment: "Refunded"
    },
    { 
        id: "BK005", 
        student: "Tom Brown", 
        room: "Studio Room 505", 
        checkIn: "2024-04-10", 
        duration: "12 months",
        status: "Confirmed",
        payment: "Partially Paid"
    }
];

// API Functions
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (data.success) {
            return data.data;
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function addData(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Failed to add data' };
    }
}

async function updateData(endpoint, id, data) {
    try {
        const response = await fetch(`${endpoint}?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Failed to update data' };
    }
}

async function deleteData(endpoint, id) {
    try {
        const response = await fetch(`${endpoint}?id=${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Failed to delete data' };
    }
}

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn && !window.location.href.includes('admin-login.html')) {
        window.location.href = 'admin-login.html';
    } else if (isLoggedIn && window.location.href.includes('admin-login.html')) {
        window.location.href = 'admin-dashboard.html';
    }
}

// Handle admin login
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        const errorMessage = document.getElementById('loginError');

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'admin-dashboard.html';
        } else {
            errorMessage.textContent = 'Invalid username or password';
            errorMessage.style.display = 'block';
        }
    });
}

// Handle logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    });
}

// Dashboard functionality
async function initializeDashboard() {
    if (!window.location.href.includes('admin-dashboard.html')) return;

    // Handle sidebar navigation
    const menuItems = document.querySelectorAll('.admin-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Update active menu item
            menuItems.forEach(i => i.parentElement.classList.remove('active'));
            item.parentElement.classList.add('active');
            
            // Handle section visibility
            const sectionId = item.getAttribute('href').substring(1);
            document.querySelectorAll('.section, #dashboard-overview').forEach(section => {
                section.classList.remove('active-section');
            });
            
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active-section');
                
                // Initialize appropriate section
                switch(sectionId) {
                    case 'students':
                        const students = await fetchData(API_ENDPOINTS.STUDENTS);
                        renderStudentsTable(students);
                        break;
                    case 'rooms':
                        const rooms = await fetchData(API_ENDPOINTS.ROOMS);
                        renderRoomsTable(rooms);
                        break;
                    case 'bookings':
                        const bookings = await fetchData(API_ENDPOINTS.BOOKINGS);
                        renderBookingsTable(bookings);
                        break;
                    case 'payments':
                        const payments = await fetchData(API_ENDPOINTS.PAYMENTS);
                        renderPaymentsTable(payments);
                        break;
                }
            } else if (sectionId === 'dashboard') {
                document.getElementById('dashboard-overview').classList.add('active-section');
                await loadDashboardStats();
            }
        });
    });

    // Initialize dashboard stats
    await loadDashboardStats();

    // Initialize tables
    const currentSection = document.querySelector('.admin-menu li.active a').getAttribute('href').substring(1);
    if (currentSection === 'students') {
        const students = await fetchData(API_ENDPOINTS.STUDENTS);
        renderStudentsTable(students);
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    const students = await fetchData(API_ENDPOINTS.STUDENTS);
    const rooms = await fetchData(API_ENDPOINTS.ROOMS);
    const bookings = await fetchData(API_ENDPOINTS.BOOKINGS);
    const payments = await fetchData(API_ENDPOINTS.PAYMENTS);

    document.querySelector('.stat-number:nth-child(1)').textContent = students.length;
    document.querySelector('.stat-number:nth-child(2)').textContent = rooms.filter(r => r.status === 'Available').length;
    document.querySelector('.stat-number:nth-child(3)').textContent = bookings.filter(b => b.status === 'Pending').length;
    
    const monthlyRevenue = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    document.querySelector('.stat-number:nth-child(4)').textContent = `$${monthlyRevenue.toFixed(2)}`;
}

// Form submission handlers
async function handleFormSubmission(formId, endpoint, successCallback) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            const id = data.id;
            delete data.id;

            let result;
            if (id) {
                result = await updateData(endpoint, id, data);
            } else {
                result = await addData(endpoint, data);
            }

            if (result.success) {
                const updatedData = await fetchData(endpoint);
                successCallback(updatedData);
                closeModal(formId);
                alert(result.message);
            } else {
                alert(result.message);
            }
        });
    }
}

// Initialize form handlers
handleFormSubmission('studentForm', API_ENDPOINTS.STUDENTS, renderStudentsTable);
handleFormSubmission('roomForm', API_ENDPOINTS.ROOMS, renderRoomsTable);
handleFormSubmission('bookingForm', API_ENDPOINTS.BOOKINGS, renderBookingsTable);
handleFormSubmission('paymentForm', API_ENDPOINTS.PAYMENTS, renderPaymentsTable);

// Helper function to close modal
function closeModal(formId) {
    const modal = document.getElementById(formId).closest('.modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Helper function to render students table
function renderStudentsTable(students) {
    const studentsTableBody = document.getElementById('studentsTableBody');
    if (!studentsTableBody) return;

    studentsTableBody.innerHTML = students.map(student => `
        <tr>
            <td>
                <div class="student-info">
                    <img src="../images/student-avatar.svg" alt="Student Avatar" class="student-avatar">
                    <span>${student.id}</span>
                </div>
            </td>
            <td>${student.name}</td>
            <td>${student.roomType}</td>
            <td>${student.roomNumber}</td>
            <td>${student.checkInDate}</td>
            <td><span class="status-${student.status.toLowerCase()}">${student.status}</span></td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Student management functions
function editStudent(id) {
    const student = SAMPLE_STUDENTS.find(s => s.id === id);
    if (student) {
        document.getElementById('studentModalTitle').textContent = 'Edit Student';
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentRoomType').value = student.roomType;
        document.getElementById('studentRoomNumber').value = student.roomNumber;
        document.getElementById('studentCheckInDate').value = student.checkInDate;
        document.getElementById('studentStatus').value = student.status;
        document.getElementById('studentModal').style.display = 'block';
    }
}

function deleteStudent(id) {
    if (confirm(`Are you sure you want to delete student ${id}?`)) {
        const index = SAMPLE_STUDENTS.findIndex(s => s.id === id);
        if (index !== -1) {
            SAMPLE_STUDENTS.splice(index, 1);
            renderStudentsTable(SAMPLE_STUDENTS);
        }
    }
}

// Helper function to render bookings table
function renderBookingsTable(bookings) {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    if (!bookingsTableBody) return;

    bookingsTableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>
                <div class="student-info">
                    <img src="../images/student-avatar.svg" alt="Student Avatar" class="student-avatar">
                    <span>${booking.student}</span>
                </div>
            </td>
            <td>${booking.room}</td>
            <td>${booking.checkIn}</td>
            <td>${booking.duration}</td>
            <td><span class="status-${booking.status.toLowerCase()}">${booking.status}</span></td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editBooking('${booking.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="confirmDeleteBooking('${booking.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Booking management functions
async function editBooking(id) {
    const bookings = await fetchData(API_ENDPOINTS.BOOKINGS);
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        document.getElementById('bookingModalTitle').textContent = 'Edit Booking';
        document.getElementById('bookingId').value = booking.id;
        document.getElementById('bookingStudent').value = booking.student;
        document.getElementById('bookingRoom').value = booking.room;
        document.getElementById('bookingCheckIn').value = booking.checkIn;
        document.getElementById('bookingDuration').value = booking.duration;
        document.getElementById('bookingStatus').value = booking.status;
        document.getElementById('bookingModal').style.display = 'block';
    }
}

async function confirmDeleteBooking(id) {
    if (confirm(`Are you sure you want to delete booking ${id}?`)) {
        const result = await deleteData(API_ENDPOINTS.BOOKINGS, id);
        if (result.success) {
            const bookings = await fetchData(API_ENDPOINTS.BOOKINGS);
            renderBookingsTable(bookings);
            alert(result.message);
        } else {
            alert(result.message);
        }
    }
}

// Initialize admin functionality
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeDashboard();
}); 