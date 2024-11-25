const messageDiv = document.getElementById('message');
const firstNameSpan = document.getElementById('firstName');
const lastNameSpan = document.getElementById('lastName');
const emailSpan = document.getElementById('email');
const phoneSpan = document.getElementById('phone');
const birthDateSpan = document.getElementById('birthDate');
const genderSpan = document.getElementById('gender');
const addressSpan = document.getElementById('address');
const logoutButton = document.getElementById('logoutButton');
const deleteButton = document.getElementById('deleteAccountButton');
const userSection = document.getElementById('userSection');
const registerAdmin = document.getElementById('registerAdm');
const doctorList = document.getElementById('doctor-list');
const doctorsSection = document.getElementById('doctorsSection');
const mainContent = document.getElementById('main-content');
const patientsSection = document.getElementById('patientsSection');
const appointmentsSection = document.getElementById('appointmentsSection');
const bookAppointment = document.getElementById('book-appointment');
const adminHero = document.getElementById('adminHero');
const addDocBtn = document.getElementById('addDocBtn');
const deleteDocBtn = document.getElementById('deleteDocBtn');
const updateDocBtn = document.getElementById('updateDocBtn');
const deleteDoctorsSection = document.getElementById('deleteDoctorForm');

function showMessage(type, text) {
    messageDiv.style.display = 'block';
    if (type == 'success') {
        messageDiv.style.color = 'green';
    } else {
        messageDiv.style.color = 'red';
    }
    
    messageDiv.textContent = text; // Display the actual message text

    // Use setTimeout to hide the message after 3 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {

// Patient registration
// Add event listener to the registration form to handle the form submission
document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Get form input values
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    const dateOfBirth = document.getElementById('regDateOfBirth').value;
    const gender = document.getElementById('regGender').value;
    const address = document.getElementById('regAddress').value;

    // Send a POST request to the server to register the user
    const response = await fetch('/auth/register', {
        method: 'POST', // Use POST for user registration
        headers: {
            'Content-Type': 'application/json' // Specify that we're sending JSON data
        },
        // Prepare the form data as JSON to be sent to the backend
        body: JSON.stringify({
            firstName, // First name from form input
            lastName,  // Last name from form input
            email,      // Email from form input
            password,   // Password from form input (to be hashed server-side)
            phone,      // Phone number from form input
            dateOfBirth, // Date of birth from form input
            gender,     // Gender from form input
            address     // Address from form input
        })
    });

    // Parse the response from the server
    const result = await response.json();

    // Handle the response based on the status code
    if (response.status === 201) {
        // Successful registration
        showMessage('success', result.message);
        document.getElementById('registerForm').reset();  // Reset the form fields
    } else {
        // Failed registration (e.g., validation errors, user already exists)
        showMessage('failed', result.message);
    }
});

// Admin registration
// Add event listener to the registration form to handle the form submission
document.getElementById('registerAdmin')?.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Get form input values
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('adminConfirmPassword').value;
    const role = document.getElementById('adminRole').value;

    // Password match validation
    if (password !== confirmPassword) {
        showMessage('error', 'Passwords do not match.');
        return; // Stop form submission if passwords don't match
    }

    // Check if terms are accepted
    if (!document.getElementById('adminTerms').checked) {
        showMessage('error', 'Please accept the terms and conditions.');
        return;
    }

    // Send a POST request to the server to register the admin
    const response = await fetch('/auth/register-admin', {
        method: 'POST', // Use POST for admin registration
        headers: {
            'Content-Type': 'application/json' // Specify that we're sending JSON data
        },
        // Prepare the form data as JSON to be sent to the backend
        body: JSON.stringify({
            username,   // Admin username from form input
            password,   // Password from form input (to be hashed server-side)
            role       // Role from form input
        })
    });

    // Parse the response from the server
    const result = await response.json();

    // Handle the response based on the status code
    if (response.status === 201) {
        // Successful registration
        showMessage('success', 'Admin registered successfully.');
        document.getElementById('adminRegisterForm').reset();  // Reset the form fields
    } else {
        // Failed registration (e.g., validation errors, user already exists)
        showMessage('error', result.message);
    }
});

// User login
document.getElementById('loginForm')?.addEventListener('submit', async(event)=>{
    event.preventDefault();

    // Get form input values
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;

    // Send a post request to the server to login user
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json' // specify that we're sending json data to the server.
        },
        // Prepare the form data as json to be sent to the backend.
        body: JSON.stringify({ identifier, password})
    });

    // Parse the response from the server
    const result = await response.json();

    // Handle the response based on status code
    if (response.status === 200) {
        // Successful login
        showMessage('success', result.message);
    
        // Hide login form
        document.getElementById('login').style.display = 'none';
    
        // Check the user role from the server response and display the correct dashboard section
        if (result.userRole === 'admin') {
            // Display admin dashboard
            document.getElementById('dashboardSection').style.display = 'block';
        } else if (result.userRole === 'patient') {
            // Display patient dashboard
            document.getElementById('userSection').style.display = 'block';
            getUser(); // Fetch and display user data if needed
        }
    
        // Reset the form fields after showing the dashboard
        document.getElementById('loginForm').reset();
    } else {
        // Failed login
        showMessage('failed', result.message);
        alert(result.message);
    }
});

// edit user
document.getElementById('editForm').addEventListener('submit', async(event)=>{
    event.preventDefault();

    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const phone = document.getElementById('editPhone').value;
    const dateOfBirth = document.getElementById('editDateOfBirth').value;
    const gender = document.getElementById('editGender').value;
    const address = document.getElementById('editAddress').value;

    // transmit the data
    const response = await fetch('/auth/profile/update',{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, phone, dateOfBirth, gender, address })
    });

    const result = await response.json();

    if(response.status === 200){
        showMessage('success', result.message);
        getUser();
    } else {
        showMessage('failed', result.message);
    }
});

// Add new doctor
document.getElementById('addDoctorForm').addEventListener('submit', async(event)=>{
    event.preventDefault();

    const firstName = document.getElementById('addFirstName').value;
    const lastName = document.getElementById('addLastName').value;
    const specialization = document.getElementById('addSpecialization').value;
    const email = document.getElementById('addEmail').value;
    const phone = document.getElementById('addPhone').value;
    const schedule = document.getElementById('addSchedule').value;

    // transmit the data
    const response = await fetch('/auth/POST/doctor',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, specialization, email, phone, schedule })
    });

    const result = await response.json();

    if(response.status === 201){
        showMessage('success', result.message);
        loadDoctors();
        document.getElementById('addDoctorsForm').reset();
    } else {
        showMessage('failed', result.message);
    }
});

// Update the doctor
document.getElementById('updateDoctorForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect form data
    const doctorId = document.getElementById('updateDocId').value.trim();
    const firstName = document.getElementById('updateFirstName').value.trim();
    const lastName = document.getElementById('updateLastName').value.trim();
    const specialization = document.getElementById('updateSpecialization').value.trim();
    const email = document.getElementById('updateEmail').value.trim();
    const phone = document.getElementById('updatePhone').value.trim();
    const schedule = document.getElementById('updateSchedule').value.trim();

    // Transmit the data
    try {
        const response = await fetch('/auth/update/doctor', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ doctorId, firstName, lastName, specialization, email, phone, schedule }),
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('success', result.message);
            loadDoctors(); // Refresh the doctor list
            document.getElementById('updateDoctorForm').reset();
        } else {
            showMessage('failed', result.message || 'Failed to update doctor.');
        }
    } catch (error) {
        console.error('Error updating doctor:', error);
        showMessage('failed', 'Server error. Please try again later.');
    }
});
// delete a doctor
document.getElementById('deleteDoctorForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect form data
    const doctorId = document.getElementById('docId').value.trim();
    // Transmit the data
    try {
        const response = await fetch('/auth/delete/doctor', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ doctorId }),
        });

        const result = await response.json();

        if (response.status === 204) {
            showMessage('success', 'Doctor successfully deleted.');
            loadDoctors(); // Refresh the doctor list
            document.getElementById('deleteDoctorForm').reset();
        } else {
            const result = await response.json();
            showMessage('failed', result.message || 'Failed to delete doctor.');
        }
    } catch (error) {
        console.error('Error deleting doctor:', error);
        showMessage('failed', 'Server error. Please try again later.');
    }
});

// Delete Account
deleteButton.addEventListener('click', async () => {
    const response = await fetch('/auth/delete-account', {
        method: 'DELETE'
    });
    if(response.status === 200){
        const result = response.json();
        showMessage('success', result.message);
        userSection.style.display = 'none';
        document.getElementById('login').style.display='block';
        document.getElementById('registerForm').style.display='block';
    } else {
        showMessage('failed', result.message);
    }
});
   
});

//logout
logoutButton.addEventListener('click', async () => {
    const response = await fetch('/auth/logout', {
        method: 'GET'
    });
    if(response.status === 200){
        const result = response.json();
        showMessage('success', result.message);
        userSection.style.display = 'none';
        document.getElementById('login').style.display='block';
    } else {
        showMessage('failed', result.message);
    }
});

// Fetch user details
async function getUser () {
        // Make a request to the backend to get the user's profile
        const response = await fetch('/auth/profile', {
            method: 'GET'
        });

        // Parse the JSON response
        const result = await response.json();

        // Check if the response is successful
        if (response.status === 200) {
            // Update the UI with user profile data
            firstNameSpan.textContent = result.user.first_name;
            lastNameSpan.textContent = result.user.last_name;
            emailSpan.textContent = result.user.email;
            phoneSpan.textContent = result.user.phone;
            birthDateSpan.textContent = result.user.date_of_birth;
            genderSpan.textContent = result.user.gender;
            addressSpan.textContent = result.user.address;
            // Display the user section
            userSection.style.display = 'block';
        } else {
            // Display an error message if fetching failed
            showMessage('failed', result.message || 'Failed to fetch user details');
        }
}

// Function to load doctors
async function loadDoctors() {
    doctorsSection.style.display = "block";
    patientsSection.style.display = "none";
    appointmentsSection.style.display = "none";
    adminHero.style.display = "none";

    doctorList.innerHTML = "<p>Loading doctors list...</p>";

    const response = await fetch('/auth/GET/doctors', { method: 'GET' });

    if (response.ok) {
        const result = await response.json();
        doctorList.innerHTML = ''; // Clear loading message

        result.forEach(doctor => {
            const doctorCard = document.createElement('div');
            doctorCard.classList.add('doctor-card');
            doctorCard.innerHTML = `
                <p><strong>Doctor ID:</strong> ${doctor.id}</p>
                <p><strong>First Name:</strong> ${doctor.first_name}</p>
                <p><strong>Last Name:</strong> ${doctor.last_name}</p>
                <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                <p><strong>Email:</strong> ${doctor.email}</p>
                <p><strong>Phone:</strong> ${doctor.phone}</p>
                <p><strong>Schedule:</strong> ${doctor.schedule}</p>
            `;
            doctorList.appendChild(doctorCard);
        });
    } else {
        doctorList.innerHTML = "<p>Failed to load doctors list. Please try again later.</p>";
    }
}

// Function to load patients
async function loadPatients() {
    patientsSection.style.display = "block";
    doctorsSection.style.display = "none";
    appointmentsSection.style.display = "none";
    adminHero.style.display = "none";

    patientsSection.innerHTML = "<p>Loading patients...</p>";

    const response = await fetch('/auth/patients', { method: 'GET' });

    if (response.ok) {
        const patients = await response.json();
        patientsSection.innerHTML = '';

        const table = document.createElement('table');
        table.classList.add('patients-table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Address</th>
        `;
        table.appendChild(headerRow);

        patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.first_name}</td>
                <td>${patient.last_name}</td>
                <td>${patient.email}</td>
                <td>${patient.phone}</td>
                <td>${patient.date_of_birth}</td>
                <td>${patient.gender}</td>
                <td>${patient.address}</td>
            `;
            table.appendChild(row);
        });
        patientsSection.appendChild(table);
    } else {
        patientsSection.innerHTML = "<p>Failed to load patients. Please try again later.</p>";
    }
}

// Function to load appointments
async function loadAppointments() {
    doctorsSection.style.display = "none";
    patientsSection.style.display = "none";
    appointmentsSection.style.display = "block"; // Ensure other sections are hidden
    adminHero.style.display = "none";

    mainContent.innerHTML = "<p>Loading appointments...</p>";

    const response = await fetch('/auth/appointments', { method: 'GET' });

    if (response.ok) {
        const appointments = await response.json();
        mainContent.innerHTML = '';

        const table = document.createElement('table');
        table.classList.add('appointments-table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Patient ID</th>
            <th>Doctor ID</th>
            <th>Appointment Date</th>
            <th>Appointment Time</th>
            <th>Status</th>
        `;
        table.appendChild(headerRow);

        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.patient_id}</td>
                <td>${appointment.doctor_id}</td>
                <td>${appointment.appointment_date}</td>
                <td>${appointment.appointment_time}</td>
                <td>${appointment.status}</td>
            `;
            table.appendChild(row);
        });

        mainContent.appendChild(table);
    } else {
        mainContent.innerHTML = "<p>Failed to load appointments. Please try again later.</p>";
    }
}
// Event listener to handle anchor tag clicks on admin page
document.addEventListener('DOMContentLoaded', () => {
    // Select all links within .admin-list
    const adminLinks = document.querySelectorAll('.admin-list a');


    // If links are found, add event listeners to each
    if (adminLinks.length > 0) {
        adminLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();

                const section = link.getAttribute('data-content');
                
                if (section === 'viewPatients') {
                    loadPatients();
                } else if (section === 'manageDoctors') {
                    loadDoctors();
                } else if (section === 'viewAppointments') {
                    console.log("Loading Appointments...");
                    loadAppointments();
                } else {
                    console.error("Unknown section:", section);
                }
            });
        });
    } else {
        console.error("No links found with '.admin-list a' selector.");
    }
});

// JavaScript to handle form submissions and display appointments
document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/auth/book/appointment', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
        loadAppointments();
    }
});

document.getElementById('updateForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/auth/appointment', {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
        loadAppointments();
    }
});

async function loadAppointments() {
    const response = await fetch('/auth/appointments');
    const appointments = await response.json();
    const tableBody = document.getElementById('appointmentsTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear previous appointments

    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.appointment_id}</td>
            <td>${appointment.doctor_id}</td>
            <td>${appointment.appointment_date}</td>
            <td>${appointment.appointment_time}</td>
            <td>${appointment.appointment_status}</td>
            <td>
                <button class="cancel-button" data-id="${appointment.appointment_id}">Cancel</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for cancel buttons
    document.querySelectorAll('.cancel-button').forEach(button => {
        button.addEventListener('click', async function() {
            const appointmentId = this.getAttribute('data-id');
            const response = await fetch('auth/appointment', {
                method: 'DELETE',
                body: JSON.stringify({ appointmentId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                loadAppointments();
            }
        });
    });
}

// Load appointments on page load
window.onload = loadAppointments;

async function fetchAvailableSlots() {
    const doctorId = document.getElementById('doctorId').value;
    const appointmentDateInput = document.getElementById('appointmentDate');
    const appointmentTimeSelect = document.getElementById('appointmentTime');

    // Clear previous times
    appointmentTimeSelect.innerHTML = '<option value="">Select Time</option>';

    if (doctorId) {
        try {
            const response = await fetch(`/auth/doctors/${doctorId}/available-slots`); // Adjust the URL as needed
            const slots = await response.json();

            // Populate the date input with available dates
            appointmentDateInput.value = slots.availableDate; // Assuming the response includes a suggested date

            // Populate the time select dropdown
            slots.availableTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time; // Time in the correct format
                option.textContent = time; // Displayed time
                appointmentTimeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching available slots:', error);
        }
    }
}

// Checking login status before proceeding to booking page
async function checkLoginAndBook() {
    try {
        const response = await fetch('/auth/check-login', { method: 'GET', credentials: 'include' });
        if (!response.ok) {
            throw new Error('User is not logged in');
        }
        // User is logged in, redirect to booking page
        location.href = './public/book.html';
    } catch (error) {
        alert('You must be logged in to book an appointment. Please log in first.');
    }
}


