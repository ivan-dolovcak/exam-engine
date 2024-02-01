<?php
session_start();

$documentID = Util::deobfuscateID($_GET["documentID"]);
$answers = file_get_contents("php://input");
if (empty($answers))
    $answers = "[]";

$datetimeStart = "2024-1-1 10:00:00"; // TODO: implement this

$submissionID = Submission::create(
    $documentID, $_SESSION["userID"], $datetimeStart, $answers);

if (! $submissionID) {
    echo $_SESSION["formMsg"];
    die;
}

if ($_GET["documentType"] == "exam")
    Submission::grade($submissionID);
