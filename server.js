const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Enable parsing of URL-encoded bodies

// CORS setup to allow cross-origin requests
app.use(cors());

// Serve the React app (change this to the correct build folder if needed)
app.use(express.static(path.join(__dirname, 'my-vite-react-app', 'dist')));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-vite-react-app', 'dist', 'index.html'));
});

// Connect to MySQL Database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Judeawoh15',
    database: 'medmeet',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection
db.getConnection((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

// Handle Signup Form Submission
app.post('/api/signup', async (req, res) => {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format using a regex pattern
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Determine the table based on the role
    let tableName;
    if (role === 'patient') {
        tableName = 'Patients';
    } else if (role === 'doctor') {
        tableName = 'Doctors';
    } else {
        return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if the email already exists in the database
    const checkEmailQuery = `SELECT * FROM ${tableName} WHERE Email_Address = ?`;
    db.query(checkEmailQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Error checking email' });
        }

        // If email already exists
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user data into the database
        const sql = `INSERT INTO ${tableName} (Full_name, Email_Address, Password) VALUES (?, ?, ?)`;
        db.query(sql, [fullName, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Error saving data' });
            }
            console.log('Added:', result);
            // Respond with a success message, frontend can use this to redirect to login page
            return res.status(200).json({ message: 'Signup successful, please log in.', redirectTo: 'patient-portal'});
        });
    });
});

// Handle Login Form Submission
app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Determine the table based on the role
    let tableName;
    if (role === 'patient') {
        tableName = 'Patients';
    } else if (role === 'doctor') {
        tableName = 'Doctors';
    } else {
        return res.status(400).json({ error: 'Invalid role' });
    }

    // Check for user in the database
    const sql = `SELECT * FROM ${tableName} WHERE Email_Address = ?`;
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ error: 'Error during login' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "You don't have an account, Please Sign Up" });
        }

        const user = results[0];

        // Compare the hashed password
        const passwordMatch = await bcrypt.compare(password, user.Password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong password, please try again or Sign Up' });
        }

        // JWT Token generation or session management can be added here if necessary
        // For now, you can return a success message or token
        return res.status(200).json({ message: 'Login successful', redirectTo: '/patient-portal' });
    });
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
