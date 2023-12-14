<?php
session_start();

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

// Fetch form data
$email = $_POST["email"];
$password = $_POST["password"];
$firstName = $_POST["firstName"];
$lastName = $_POST["lastName"];

$user = User::ctorViaRegister($email, $password, $firstName, $lastName);

// Check register
$_SESSION["formMsg"] = $user->register();
if ($_SESSION["formMsg"] !== null)
    // In case of registration error, show form again with error message:
    Util::redirect("/views/register.php");

// Register success: login user and redirecto to home view
$user->login($password); // Shouldn't return any errors
Util::redirect("/views/home.php");
