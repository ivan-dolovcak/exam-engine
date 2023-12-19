<?php
session_start();

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

// Fetch form data
$username = Util::sanitizeFormInput($_POST["username"]);
$email = Util::sanitizeFormInput($_POST["email"]);
$password = Util::sanitizeFormInput($_POST["password"]);
$passwordConfirm = Util::sanitizeFormInput($_POST["passwordConfirm"]);
$firstName = Util::sanitizeFormInput($_POST["firstName"]);
$lastName = Util::sanitizeFormInput($_POST["lastName"]);

// Check password confirm
if ($password !== $passwordConfirm) {
    $_SESSION["formMsg"] = "Greška: lozinke se ne podudaraju.";
    Util::redirect("/views/register.php");
}

$user = User::ctorViaRegister($username, $email, $password, $firstName, 
    $lastName);

// Check register
$_SESSION["formMsg"] = $user->register();
if ($_SESSION["formMsg"] !== null)
    // In case of registration error, show form again with error message:
    Util::redirect("/views/register.php");

// Register success: login user and redirect to to home view
$user->login($username, $password); // Shouldn't return any errors
Util::redirect("/views/home.php");
