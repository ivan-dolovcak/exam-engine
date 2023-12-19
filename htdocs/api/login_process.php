<?php
session_start();

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

// Fetch form data
$emailOrPassword = Util::sanitizeFormInput($_POST["emailOrPassword"]);
$password = Util::sanitizeFormInput($_POST["password"]);

$user = User::ctorEmpty();

// Check login
$_SESSION["formMsg"] = $user->login($emailOrPassword, $password);
if ($_SESSION["formMsg"] !== null)
    // In case of login error, show form again with error message:
    Util::redirect("/views/login.php");

// Login success:
Util::redirect("/views/home.php");
