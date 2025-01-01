const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error } = require('console');

// Create Express app 
const app = express();

// Middleware to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Enable parsing of URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public'));
});

// Connect to MySQL Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', //
    password: 'Judeawoh15', // 
    database: 'medmeet' // 
});

// Test Database Connection
db.connect(err => {
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
        return res.status(400).send('All fields are required');
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
   
    //Determine the table based on the role
    let tableName;
    if (role === 'patient') {
        tableName = 'Patients'; // For patients, use the Patients table
    } 
    else {
        tableName = 'Doctors'; // For doctors, use the Doctors table
    }

    // Insert user data into the database
    const sql = `INSERT INTO ${tableName} (Full_name, Email_Address, Password) VALUES (?, ?, ?)`;
    db.query(sql, [fullName, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error saving data');
            return;
        }
        console.log('Added:', result);
        res.redirect("/");
    });
});

//Handle Login Form Submission 
app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
        return res.status(400).json({error: 'All fields are required' });
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
            return res.status(500).send('Error during login');
        }

        if (results.length === 0) {
            return res.status(401).json({ error: `You don't have an account, Please Sign Up`});
        }

        const user = results[0];

        // Compare the hashed password
        const passwordMatch = await bcrypt.compare(password, user.Password);
        if (!passwordMatch) {
            return res.status(401).json({ error: `Wrong Password, please enter the right password or Sign Up`});
        }

        // Redirect based on role
        if (role === 'patient') {
            res.redirect('public/Patient Home Page.html');
        } else if (role === 'doctor') {
            res.redirect('public/Doctor Home Page.html');
        }
    });
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
