// Import necessary packages
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Function to handle user registration
exports.registerUser = async (req, res)=>{
    try{
        // Validate incoming request data
        const errors = validationResult(req);
        if(!errors.isEmpty()){
           return res.status(400).json({error: errors.array()});
        }
        const { firstName, lastName, email, password, phone, dateOfBirth, gender, address} = req.body;
        // Check if the user already exists
        const [existingUser] = await db.execute('SELECT email FROM Patients WHERE email = ?', [email]);
        if(existingUser.length>0){
           return res.status(400).json({message: 'User already exists!'})
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert a new user into the database
        await db.execute('INSERT INTO Patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, email, hashedPassword, phone, dateOfBirth, gender, address]);
        
        res.status(201).json({message: 'User registered successfully!'});

    } catch(error){
        console.error('Error in registering the user', error);
        res.status(500).json({message: 'Server error'});
    }
}

// Function to handle user login
exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body; // login identifier

  try {
      // Check if the user is an admin or patient
      let user;
      let userRole;

      if (identifier.includes('@')) {
          // If identifier contains '@', treat it as an email (patient login)
          const [patient] = await db.execute('SELECT * FROM Patients WHERE email = ?', [identifier]);
          if (patient.length === 0) {
              return res.status(401).json({ message: 'Invalid email or password.' });
          }
          user = patient[0];
          userRole = 'patient';
          req.session.userRole = userRole;
      } else {
          // Otherwise, treat it as a username (admin login)
          const [admin] = await db.execute('SELECT * FROM Admin WHERE username = ?', [identifier]);
          if (admin.length === 0) {
              return res.status(401).json({ message: 'Invalid username or password.' });
          }
          user = admin[0];
          userRole = 'admin';
          req.session.userRole = userRole;
      }

      // Compare the password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
          return res.status(401).json({ message: 'Invalid username/email or password.' });
      }

      // Set up session for the user
      req.session.userId = user.id;
      req.session.name = user.first_name || user.username; // Use first_name for patients, username for admins

      // Save the session and send a response
      req.session.save((err) => {
          if (err) {
              console.error('Session save error:', err);
              return res.status(500).json({ message: 'Server error during session save.' });
          }
          // Include userRole in the response to help frontend determine the correct dashboard
          res.status(200).json({ message: 'Login successful.', userRole });
      });

  } catch (error) {
      console.error('Error during login', error);
      res.status(500).json({ message: 'Server error.' });
  }
};


// Function to handle user logout
exports.logoutUser = async (req, res)=>{
    try{
        // Destroy the session
        req.session.destroy((err)=>{
            if(err){
                console.error('Error during logout', err);
                return res.status(500).json({message: 'Server error.'});
            }

            res.clearCookie('session_cookie_name');
            res.status(200).json({message: 'Logout successful.'})
        })
    } catch(error){
        console.error('Error during logout.', error);
        res.status(500).json({message: 'Server error.'});
    }
};

// Function to view user profile
exports.viewProfile = async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {

    // Retrieve user details from the database
    const [user] = await db.execute(
      'SELECT first_name, last_name, email, phone, date_of_birth, gender, address FROM Patients WHERE id = ?',
      [req.session.userId]
    );

    // Check if user exists
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user details wrapped inside a "user" object for frontend to access it.
    res.status(200).json({user: user[0]});
  } catch (error) {
    console.error('Error fetching user profile:', error); // Log the exact error
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// Function to Update patient profile
exports.updateProfile = async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { firstName, lastName, phone, dateOfBirth, gender, address } = req.body;

    // Update user profile in the database
    await db.execute(
      'UPDATE Patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?',
      [firstName, lastName, phone, dateOfBirth, gender, address, req.session.userId]
    );

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error in updating user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Function to handle account deletion
exports.deleteAccount = async (req, res)=>{
    try{
    const userId = req.session.userId;
    // Delete user account from the database
    await db.execute('DELETE FROM Patients WHERE id = ?', [userId]);

    // Destroy the session
    req.session.destroy((error)=>{
        if(error){
            console.error('Error during account deletion', error);
            return res.status(500).json({message: 'Server error.'})
        }

        res.clearCookie('session_cookie_name');
        res.status(200).json({message: 'Account deleted successfully.'});
    }) 
  } catch(error){
    console.error('Error during account deletion', error);
    res.status(500).json({message: 'Server error.'})
}
};

// Function to handle admin registration
exports.registerAdmin = async (req, res) => {
  try {
      // Validate incoming request data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ error: errors.array() });
      }

      const { username, password, role } = req.body;

      // Check if the admin already exists
      const [existingAdmin] = await db.execute('SELECT username FROM Admin WHERE username = ?', [username]);
      if (existingAdmin.length > 0) {
          return res.status(400).json({ message: 'Admin already exists!' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert a new admin into the database
      await db.execute('INSERT INTO Admin (username, password_hash, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);

      res.status(201).json({ message: 'Admin registered successfully!' });

  } catch (error) {
      console.error('Error in registering the admin:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

// Function to display a list of patients (admin only)
exports.listPatients = async (req, res)=>{
    try{
        // Check if the user is an admin
        if(req.session.userRole !== 'admin'){
            return res.status(403).json({message: 'Access denied.'})
        }

        // Fetch all patients from the database
        const [patients] = await db.execute('SELECT * FROM Patients');
        res.status(200).json(patients);

    } catch(error){
        console.error('Error fetching patients data', error);
        res.status(500).json({message: 'Server error.'})
    }
};

// Function to add a new doctor (admin only)
exports.addDoctor = async (req, res)=>{
    try{
        // Check if the user is an admin
        if(req.session.userRole !== 'admin'){
            return res.status(403).json({message: 'Access denied!'});
        }

        const { firstName, lastName, specialization, email, phone, schedule } = req.body;

        // Check if the doctor already exists
        const [existingDoctor] = await db.execute('SELECT email FROM Doctors WHERE email=?', [email]);

        if(existingDoctor.length > 0){
            return res.status(400).json({message: 'Doctor already exists!'})
        }

        // insert new doctor into database
        await db.execute('INSERT INTO Doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, specialization, email, phone, JSON.stringify(schedule)]);
        res.status(201).json({message: 'Doctor successfully added.'});

    } catch(error){
        console.error('Error adding doctor', error);
        res.status(500).json({message: 'Server error.'})
    }
};

// Function to display a list of doctors
exports.listDoctors = async (req, res)=>{
    try{
        // fetch all doctors from the database
        const [doctors] = await db.execute('SELECT * FROM Doctors');
        res.status(200).json(doctors);
    } catch(error){
        console.error('Error fetching doctors', error);
        res.status(500).json({message: 'Server error.'});
    }
};

// Function to update doctor profile or schedule (admin or doctor)
exports.updateDoctor = async (req, res) => {
    try {
      const { doctorId, firstName, lastName, specialization,email, phone, schedule } = req.body;
  
      // Check if the user is an admin or the doctor themselves
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      // Update doctor profile in the database
      await db.execute(
        'UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email=?, phone = ?, schedule = ? WHERE id = ?',
        [firstName, lastName, specialization, email, phone, JSON.stringify(schedule), doctorId]
      );
  
      res.status(200).json({ message: 'Doctor profile updated successfully' });
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Function to delete or deactivate a doctor profile (admin only)
  exports.deleteDoctor = async (req, res) => {
    try {
      // Check if the user is an admin
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      const { doctorId } = req.body;
  
      // Delete doctor profile from the database
      await db.execute('DELETE FROM Doctors WHERE id = ?', [doctorId]);
  
      res.status(204).json({ message: 'Doctor profile deleted successfully' });
    } catch (error) {
      console.error('Error deleting doctor profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Function to book an appointment
  exports.bookAppointment = async (req, res) => {
    try {
      const { doctorId, appointmentDate, appointmentTime } = req.body;
      const patientId = req.session.userId;
  
      // Insert new appointment into the database
      await db.execute(
        'INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_status) VALUES (?, ?, ?, ?, ?)',
        [patientId, doctorId, appointmentDate, appointmentTime, 'scheduled']
      );
  
      res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Function to list appointments for a patient, doctor, or admin
exports.listAppointments = async (req, res) => {
  try {
    const { userId, userRole } = req.session;

    // Check if userId and userRole exist in the session
    if (!userId || !userRole) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    let query;
    let params = [];

    // Set up query and parameters based on user role
    if (userRole === 'patient') {
      query = 'SELECT * FROM Appointments WHERE patient_id = ?';
      params = [userId];
    } else if (userRole === 'doctor') {
      query = 'SELECT * FROM Appointments WHERE doctor_id = ?';
      params = [userId];
    } else if (userRole === 'admin') {
      query = 'SELECT * FROM Appointments'; // Admins can view all appointments
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch appointments from the database
    const [appointments] = await db.execute(query, params);

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

  // Function to update an appointment (reschedule or cancel)
  exports.updateAppointment = async (req, res) => {
    try {
      const { appointmentId, appointmentDate, appointmentTime, status } = req.body;
      const userId = req.session.userId;
      const userRole = req.session.userRole;
  
      // Check if the appointment belongs to the user
      const [appointment] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ?', [appointmentId]);
      if (appointment.length === 0) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      if (userRole === 'patient' && appointment[0].patient_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      // Update appointment in the database
      if (status) {
        await db.execute('UPDATE Appointments SET appointment_status = ? WHERE appointment_id = ?', [status, appointmentId]);
      } else {
        await db.execute(
          'UPDATE appointments SET appointment_date = ?, appointment_time = ? WHERE appointment_id = ?',
          [appointmentDate, appointmentTime, appointmentId]
        );
      }
  
      res.status(200).json({ message: 'Appointment updated successfully' });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Function to cancel an appointment
  exports.cancelAppointment = async (req, res) => {
    try {
      const { appointmentId } = req.body;
      const userId = req.session.userId;
      const userRole = req.session.userRole;
  
      // Check if the appointment belongs to the user
      const [appointment] = await db.execute('SELECT * FROM Appointments WHERE appointment_id = ?', [appointmentId]);
      if (appointment.length === 0) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      if (userRole === 'patient' && appointment[0].patient_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      // Update appointment status to 'canceled'
      await db.execute('UPDATE Appointments SET appointment_status = ? WHERE appointment_id = ?', ['canceled', appointmentId]);
  
      res.status(200).json({ message: 'Appointment canceled successfully' });
    } catch (error) {
      console.error('Error canceling appointment:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Function to check if the user is logged in
exports.checkLogin = (req, res) => {
  if (req.session.userId) {
      // User is logged in
      return res.status(200).json({ loggedIn: true });
  } else {
      // User is not logged in
      return res.status(401).json({ loggedIn: false });
  }
};