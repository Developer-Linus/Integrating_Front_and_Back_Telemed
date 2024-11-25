// Import packages/dependencies
const mysql = require('mysql2');
const dotenv = require('dotenv');

// load environment variables from .env file
dotenv.config();

// create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Export the pool for use in other parts of the application
module.exports = pool.promise();