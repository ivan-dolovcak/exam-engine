<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: /views/login.php");
    die;
}

$email = $_POST["email"];
$password = $_POST["password"];

require_once "user_controller.php";

$user = User::makeViaLogin($email, $password);

$_SESSION["formMsg"] = $user->login();

header("Location: /");
