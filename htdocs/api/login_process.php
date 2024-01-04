<?php
session_start();

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

// Fetch form data
$emailOrPassword = Util::sanitizeFormInput($_POST["emailOrPassword"]);
$password = Util::sanitizeFormInput($_POST["password"]);

$user = new User();
if (! $user->login($emailOrPassword, $password))
    // In case of login error, show form again with error message
    $_SESSION["formMsg"] = $user->errMsg;
    Util::redirect("/views/login.phtml");

Util::redirect("/views/home.phtml");
