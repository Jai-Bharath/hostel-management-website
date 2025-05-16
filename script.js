// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile navigation menu
const navLinks = document.querySelector('.nav-links');
const createMobileMenu = () => {
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.navbar').insertBefore(hamburger, navLinks);

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.querySelector('i').classList.toggle('fa-bars');
        hamburger.querySelector('i').classList.toggle('fa-times');
    });
};

if (window.innerWidth <= 768) {
    createMobileMenu();
}

// Students Section Functionality
const studentsData = [
    { id: "STD001", name: "John Doe", roomType: "Single Room", roomNumber: "A101", checkInDate: "2024-01-15", status: "Active" },
    { id: "STD002", name: "Jane Smith", roomType: "Double Room", roomNumber: "B202", checkInDate: "2024-01-20", status: "Active" },
    { id: "STD003", name: "Mike Johnson", roomType: "Triple Room", roomNumber: "C303", checkInDate: "2024-02-01", status: "Active" },
    { id: "STD004", name: "Sarah Williams", roomType: "Deluxe Single", roomNumber: "D404", checkInDate: "2024-02-05", status: "Inactive" },
    { id: "STD005", name: "Tom Brown", roomType: "Premium Double", roomNumber: "E505", checkInDate: "2024-02-10", status: "Active" },
    { id: "STD006", name: "Emily Davis", roomType: "Studio Room", roomNumber: "F606", checkInDate: "2024-02-15", status: "Active" },
    { id: "STD007", name: "David Wilson", roomType: "Single Room", roomNumber: "A102", checkInDate: "2024-02-20", status: "Active" },
    { id: "STD008", name: "Lisa Anderson", roomType: "Double Room", roomNumber: "B203", checkInDate: "2024-02-25", status: "Inactive" },
    { id: "STD009", name: "James Taylor", roomType: "Triple Room", roomNumber: "C304", checkInDate: "2024-03-01", status: "Active" },
    { id: "STD010", name: "Emma Martinez", roomType: "Deluxe Single", roomNumber: "D405", checkInDate: "2024-03-05", status: "Active" }
];

const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let filteredData = [...studentsData];

const studentSearch = document.getElementById('studentSearch');
const roomFilter = document.getElementById('roomFilter');
const studentsTableBody = document.getElementById('studentsTableBody');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');

// Function to render table data
const renderStudentsTable = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = filteredData.slice(startIndex, endIndex);

    studentsTableBody.innerHTML = pageData.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.roomType}</td>
            <td>${student.roomNumber}</td>
            <td>${formatDate(student.checkInDate)}</td>
            <td class="status-${student.status.toLowerCase()}">${student.status}</td>
        </tr>
    `).join('');

    // Update pagination
    currentPageSpan.textContent = `Page ${currentPage}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = endIndex >= filteredData.length;
};

// Format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Search and filter functionality
const filterData = () => {
    const searchTerm = studentSearch.value.toLowerCase();
    const roomType = roomFilter.value;

    filteredData = studentsData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                            student.id.toLowerCase().includes(searchTerm) ||
                            student.roomNumber.toLowerCase().includes(searchTerm);
        const matchesRoom = !roomType || student.roomType === roomType;
        return matchesSearch && matchesRoom;
    });

    currentPage = 1;
    renderStudentsTable();
};

// Event listeners for students section
if (studentSearch && roomFilter) {
    studentSearch.addEventListener('input', filterData);
    roomFilter.addEventListener('change', filterData);

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderStudentsTable();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const maxPage = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
        if (currentPage < maxPage) {
            currentPage++;
            renderStudentsTable();
        }
    });

    // Initialize table
    renderStudentsTable();
}

// Create modal HTML
const createModal = (title, content) => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close"><i class="fas fa-times"></i></span>
            <h2>${title}</h2>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
};

// Get Started button functionality
const getStartedBtn = document.querySelector('.cta-button');
if (getStartedBtn) {
    const getStartedModal = createModal('Get Started', `
        <form id="get-started-form" class="modal-form">
            <div class="form-group">
                <input type="text" placeholder="Full Name" required>
            </div>
            <div class="form-group">
                <input type="email" placeholder="Email Address" required>
            </div>
            <div class="form-group">
                <select required>
                    <option value="">Select Room Type</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Room</option>
                    <option value="triple">Triple Room</option>
                    <option value="deluxe">Deluxe Single</option>
                    <option value="premium">Premium Double</option>
                    <option value="studio">Studio Room</option>
                </select>
            </div>
            <div class="form-group">
                <input type="date" placeholder="Move-in Date" required>
            </div>
            <button type="submit" class="submit-btn">Submit Application</button>
        </form>
    `);

    getStartedBtn.addEventListener('click', () => {
        getStartedModal.classList.add('active');
    });

    const closeModal = getStartedModal.querySelector('.modal-close');
    closeModal.addEventListener('click', () => {
        getStartedModal.classList.remove('active');
    });

    // Close modal when clicking outside
    getStartedModal.addEventListener('click', (e) => {
        if (e.target === getStartedModal) {
            getStartedModal.classList.remove('active');
        }
    });

    // Handle form submission
    const getStartedForm = document.getElementById('get-started-form');
    getStartedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Here you would typically send the form data to a server
        alert('Thank you for your interest! We will contact you soon.');
        getStartedModal.classList.remove('active');
        getStartedForm.reset();
    });
}

// Room booking functionality
const bookButtons = document.querySelectorAll('.book-btn');
bookButtons.forEach(button => {
    button.addEventListener('click', function() {
        const roomCard = this.closest('.room-card');
        const roomType = roomCard.querySelector('h3').textContent;
        const roomPrice = roomCard.querySelector('.room-price span').textContent;

        const bookingModal = createModal('Book Room', `
            <form id="booking-form" class="modal-form">
                <div class="form-group">
                    <input type="text" placeholder="Full Name" required>
                </div>
                <div class="form-group">
                    <input type="email" placeholder="Email Address" required>
                </div>
                <div class="form-group">
                    <input type="tel" placeholder="Phone Number" required>
                </div>
                <div class="form-group">
                    <input type="date" placeholder="Check-in Date" required>
                </div>
                <div class="form-group">
                    <input type="date" placeholder="Check-out Date" required>
                </div>
                <div class="room-details">
                    <p><strong>Room Type:</strong> ${roomType}</p>
                    <p><strong>Price:</strong> ${roomPrice}</p>
                </div>
                <button type="submit" class="submit-btn">Confirm Booking</button>
            </form>
        `);

        bookingModal.classList.add('active');

        const closeModal = bookingModal.querySelector('.modal-close');
        closeModal.addEventListener('click', () => {
            bookingModal.classList.remove('active');
        });

        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                bookingModal.classList.remove('active');
            }
        });

        const bookingForm = bookingModal.querySelector('#booking-form');
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert(`Thank you for booking a ${roomType}! We will confirm your reservation shortly.`);
            bookingModal.classList.remove('active');
            bookingForm.reset();
        });
    });
});

// Add hover effect for room cards
document.querySelectorAll('.room-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// Add active class to current section in navigation
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Here you would typically send the form data to a server
        console.log('Form submitted:', formObject);
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.room-card, .facility-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Add initial styles for animation
document.querySelectorAll('.room-card, .facility-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Authentication Modals
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');

if (loginBtn && registerBtn) {
    // Create login modal
    const loginModal = createModal('Login', `
        <form id="login-form" class="modal-form">
            <div class="form-group">
                <input type="email" placeholder="Email Address" required>
            </div>
            <div class="form-group">
                <input type="password" placeholder="Password" required>
            </div>
            <div class="form-options">
                <label>
                    <input type="checkbox"> Remember me
                </label>
                <a href="#" class="forgot-password">Forgot Password?</a>
            </div>
            <button type="submit" class="submit-btn">Login</button>
            <p class="switch-form">Don't have an account? <a href="#" class="switch-to-register">Register here</a></p>
        </form>
    `);

    // Create registration modal
    const registerModal = createModal('Create Account', `
        <form id="register-form" class="modal-form">
            <div class="form-group">
                <input type="text" placeholder="Full Name" required>
            </div>
            <div class="form-group">
                <input type="email" placeholder="Email Address" required>
            </div>
            <div class="form-group">
                <input type="password" placeholder="Password" required>
            </div>
            <div class="form-group">
                <input type="password" placeholder="Confirm Password" required>
            </div>
            <div class="form-group">
                <select required>
                    <option value="">Select User Type</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent/Guardian</option>
                </select>
            </div>
            <button type="submit" class="submit-btn">Create Account</button>
            <p class="switch-form">Already have an account? <a href="#" class="switch-to-login">Login here</a></p>
        </form>
    `);

    // Login button click handler
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
        registerModal.classList.remove('active');
    });

    // Register button click handler
    registerBtn.addEventListener('click', () => {
        registerModal.classList.add('active');
        loginModal.classList.remove('active');
    });

    // Switch between login and register forms
    const switchToRegister = loginModal.querySelector('.switch-to-register');
    const switchToLogin = registerModal.querySelector('.switch-to-login');

    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
    });

    // Close modals
    [loginModal, registerModal].forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Handle form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        // Here you would typically send the login data to a server
        console.log('Login attempt:', { email, password });

        // Simulate successful login
        loginBtn.textContent = 'Welcome!';
        loginModal.classList.remove('active');
        loginForm.reset();

        // Update the navbar after login
        updateNavbarAfterAuth(email);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const userData = Object.fromEntries(formData.entries());

        // Here you would typically send the registration data to a server
        console.log('Registration data:', userData);

        // Simulate successful registration
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
        registerForm.reset();
    });
}

// Function to update navbar after authentication
function updateNavbarAfterAuth(email) {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <div class="user-menu">
            <button class="user-menu-btn">
                <i class="fas fa-user-circle"></i>
                <span>${email.split('@')[0]}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="user-dropdown">
                <a href="#profile"><i class="fas fa-user"></i> Profile</a>
                <a href="#settings"><i class="fas fa-cog"></i> Settings</a>
                <a href="#" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
    `;

    // Add dropdown functionality
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const userDropdown = document.querySelector('.user-dropdown');
    
    userMenuBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            userDropdown.classList.remove('active');
        }
    });

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        location.reload(); // Simple reload to reset the state
    });
} 