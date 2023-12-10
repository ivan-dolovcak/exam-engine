<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: /views/register.php");
    die;
}

$email = $_POST["email"];
$password = $_POST["password"];
$firstName = $_POST["firstName"];
$lastName = $_POST["lastName"];

require_once "user_controller.php";

$user = User::makeViaRegister($email, $password, $firstName, $lastName);

// Check register
$_SESSION["formMsg"] = $user->register();
if ($_SESSION["formMsg"] !== null) {
    // In case of registration error, show form again with error message:
    header("Location: /views/register.php");
    die;
}

// Check login
$_SESSION["formMsg"] = $user->login($password);
if ($_SESSION["formMsg"] !== null) {
    header("Location: /views/register.php");
    die;
}

header("Location: /");

