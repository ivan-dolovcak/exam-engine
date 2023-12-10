<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: /views/register.php");
    die;
}

$email = $_POST["email"];
$passwordHash = password_hash($_POST["password"], PASSWORD_BCRYPT);
$firstName = $_POST["firstName"];
$lastName = $_POST["lastName"];

require_once "user_controller.php";

$user = new User($email, $passwordHash, $firstName, $lastName);

$_SESSION["formMsg"] = $user->register();

if ($_SESSION["formMsg"] === null) { // OK
    $_SESSION["user"] = $user;
    header("Location: /");
}
else
    // In case of registration error, show form again with error message:
    header("Location: /views/register.php");

