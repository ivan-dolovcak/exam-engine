<?php
session_start();

// Only allow POST requests.
if ($_SERVER["REQUEST_METHOD"] !== "POST")
    Util::previousPage();

if (! isset($_GET["ID"]))
    Util::redirect("/views/home.phtml");

// Cleaning up form submission for encoding to JSON.
$answers = [];

foreach($_POST as $key => $value) {
    // ignore empty values:
    if (empty($value))
        continue;

    if (gettype($value) === "array") {
        // Ignore arrays with all empty strings:
        if (! array_filter($value))
            continue;

        // Sanitize inputs:
        $filteredArray = array_filter($value, 
            fn($element) => Util::sanitizeFormInput($element));
        
        $answers[] = [$key => $filteredArray];
    }
    else
        $answers[] = [$key => Util::sanitizeFormInput($value)];
}

$documentID = Util::deobfuscateID($_GET["ID"]);

$datetimeStart = "2024-1-1 10:00:00"; // TODO: implement this
if (! Submission::create(
    $documentID, $_SESSION["userID"], $datetimeStart, json_encode($answers))) {
    // TODO: user-friendy error handling
    echo $_SESSION["formMsg"];
    die;
}

Util::redirect("/views/home.phtml");
