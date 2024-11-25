// Import necessary dependencies
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authcontroller');
const checkUserRole = require('../middleware/checkUserRole'); // Import check user role middleware

const router = express.Router();

// Route for user registration
router.post(
  '/register',
  [
    // Validate and sanitize input fields
    body('firstName').notEmpty().withMessage('First name is required').trim().escape(),
    body('lastName').notEmpty().withMessage('Last name is required').trim().escape(),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').notEmpty().withMessage('Phone number is required').trim().escape(),
    body('dateOfBirth').isDate().withMessage('Invalid date of birth'),
    body('gender').notEmpty().withMessage('Gender is required').trim().escape(),
    body('address').notEmpty().withMessage('Address is required').trim().escape(),
  ],
  authController.registerUser
);

// Route for user login
router.post(
  '/login',
  [
    // Validate and sanitize input fields
    body('identifier').notEmpty().withMessage('Identifier is required'), // Identifier which is email for patients and username for admin.// Ensure identifier is not empty
    body('password').notEmpty().withMessage('Password is required')
  ], authController.loginUser
);


// Route for user logout
router.get('/logout', authController.logoutUser);

// Route to view patient profile with role-based access
router.get('/profile', checkUserRole('patient'), authController.viewProfile);

// Route for updating user profile
router.put(
  '/profile/update',
  [
    // Validate and sanitize input fields
    body('firstName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('phone').optional().trim().escape(),
    body('dateOfBirth').optional().isDate().withMessage('Invalid date of birth'),
    body('gender').optional().trim().escape(),
    body('address').optional().trim().escape(),
  ], checkUserRole('patient'), checkUserRole('patient'),
  authController.updateProfile
);

// Route for deleting user account
router.delete('/delete-account', checkUserRole('patient'), authController.deleteAccount);

// Route for registering an admin
router.post('/register-admin', [
  body('username').notEmpty().withMessage('Username is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('role').isIn(['admin', 'superadmin']).withMessage('Role must be either admin or superadmin.')
], authController.registerAdmin);

// Route for listing all patients (admin only)
router.get('/patients',checkUserRole('admin'), authController.listPatients);

// Route for adding a new doctor (admin only)
router.post(
  '/POST/doctor',
  [
    // Validate and sanitize input fields
    body('firstName').notEmpty().withMessage('First name is required').trim().escape(),
    body('lastName').notEmpty().withMessage('Last name is required').trim().escape(),
    body('specialization').notEmpty().withMessage('Specialization is required').trim().escape(),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').notEmpty().withMessage('Phone number is required').trim().escape(),
    body('schedule').notEmpty().withMessage('Schedule is required').isJSON().withMessage('Schedule must be a valid JSON'),
  ], checkUserRole('admin'),
  authController.addDoctor
);

// Route for listing all doctors
router.get('/GET/doctors', authController.listDoctors);

// Route for updating doctor profile or schedule (admin or doctor)
router.put(
  '/update/doctor',
  [
    // Validate and sanitize input fields
    body('doctorId').notEmpty().withMessage('Doctor ID is required').isInt(),
    body('firstName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('specialization').optional().trim().escape(),
    body('email').isEmail().withMessage('Email must be valid.').trim().normalizeEmail(),
    body('phone').optional().trim().escape(),
    body('schedule').optional().isJSON().withMessage('Schedule must be a valid JSON'),
  ], authController.updateDoctor
);

// Route for deleting a doctor profile (admin only)
router.delete('/delete/doctor', checkUserRole('admin'), authController.deleteDoctor);

// Route for booking an appointment
router.post(
  '/book/appointment',
  [
    // Validate and sanitize input fields
    body('doctorId').notEmpty().withMessage('Doctor ID is required').isInt(),
    body('appointmentDate').notEmpty().withMessage('Appointment date is required').isDate(),
    body('appointmentTime').notEmpty().withMessage('Appointment time is required').matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Invalid time format'),
  ],
  authController.bookAppointment
);

// Route for listing appointments for a patient or doctor
router.get('/appointments', checkUserRole(['patient', 'doctor', 'admin']), authController.listAppointments);

// Route for updating an appointment (reschedule or cancel)
router.put(
  '/update/appointment',
  [
    // Validate and sanitize input fields
    body('appointmentId').notEmpty().withMessage('Appointment ID is required').isInt(),
    body('appointmentDate').optional().isDate().withMessage('Invalid appointment date'),
    body('appointmentTime').optional().matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Invalid time format'),
    body('status').optional().isIn(['scheduled', 'completed', 'canceled']).withMessage('Invalid status'),
  ],
  authController.updateAppointment
);

// Route for canceling an appointment
router.delete(
  '/delete/appointment',
  [
    // Validate and sanitize input fields
    body('appointmentId').notEmpty().withMessage('Appointment ID is required').isInt(),
  ],
  authController.cancelAppointment
);

// Route to check if the user is logged in
router.get('/check-login', checkUserRole('patient'), authController.checkLogin);

module.exports = router;