<?php
session_start();

// Only allow POST requests.
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

// Fetch form data.
$emailOrPassword    = Util::sanitizeFormInput($_POST["emailOrPassword"]);
$password           = Util::sanitizeFormInput($_POST["password"]);

if (! User::login($emailOrPassword, $password))
    // In case of login error, show form again with error message:
    Util::redirect("/views/login.phtml");

// Show user's home page on success:
Util::redirect("/views/home.phtml");
