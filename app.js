// Import necessary modules
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config();

// Import the database pool
const db = require('./config/db');

// Import authentication routes
const authRoutes = require('./router/auth');

// Initialize the Express application
const app = express();

// Set the port for the server
const port = process.env.PORT || 4500;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(express.urlencoded({extended: true}));

// Configure Session management
const sessionStore = new MySQLStore({}, db);

app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000, // One Hour
    }
}));

// Use/mount authentication routes
app.use('/auth', authRoutes);

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));


// Start the server
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});

