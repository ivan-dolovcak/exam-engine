<?php
session_start();

// Only allow POST requests.
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

// Fetch form data.
$name           = Util::sanitizeFormInput($_POST["name"]);
$type           = Util::sanitizeFormInput($_POST["type"]);
// Optional fields:
$deadlineDate   = Util::sanitizeFormInput($_POST["deadlineDate"]) ?: null;
$deadlineTime   = Util::sanitizeFormInput($_POST["deadlineTime"]) ?: null;
$password       = Util::sanitizeFormInput($_POST["password"])     ?: null;

if (isset($password))
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

if (isset($deadlineDate))
    $deadline = $deadlineDate . "T" . $deadlineTime ?: "00:00";

// Insert into DB and redirect.
Document::create($name, $type, $passwordHash, $_SESSION["userID"], $deadline);

Util::redirect("/views/home.phtml");
