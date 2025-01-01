<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "Judeawoh15";
$dbname = "medmeet";

//Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


// Get the form data
$full_name = $_POST['full_name'];
$email = $_POST['email'];
$password = $_POST['password'];
$role = $_POST['role'];

// Validate input (add more validation as needed)
if (empty($full_name) || empty($email) || empty($password)) {
    echo "Please fill in all fields.";
    exit;
}

// Prepare and execute the insert statement
if ($role == "patient") {
    $sql = "INSERT INTO patients (full_name, email, password) VALUES (?, ?, ?)";
} else {
    $sql = "INSERT INTO doctors (full_name, email, password) VALUES (?, ?, ?)";
}

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die("Error preparing statement: " . $conn->error);
}

$stmt->bind_param("sss", $full_name, $email, $password);

if (!$stmt->execute()) {
    die("Error executing statement: " . $stmt->error);
}

echo "Registration successful!";
//echo "You can now login";

$stmt->close();
$conn->close();
?>