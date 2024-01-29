<?php
session_start();

$documentID = Util::deobfuscateID($_GET["ID"]);
$answers = file_get_contents("php://input");
if (empty($answers))
    $answers = "[]";

$datetimeStart = "2024-1-1 10:00:00"; // TODO: implement this

if (! Submission::create(
        $documentID, $_SESSION["userID"], $datetimeStart, $answers)) {
    echo $_SESSION["formMsg"];
    die;
}
