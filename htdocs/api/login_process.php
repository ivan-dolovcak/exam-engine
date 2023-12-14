<?php
session_start();

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

// Fetch form data
$email = $_POST["email"];
$password = $_POST["password"];

$user = User::ctorViaLogin($email);

// Check login
$_SESSION["formMsg"] = $user->login($password);
if ($_SESSION["formMsg"] !== null)
    // In case of login error, show form again with error message:
    Util::redirect("/views/login.php");

// Login success:
Util::redirect("/views/home.php");
