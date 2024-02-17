<?php
session_start();

$documentID = Util::deobfuscateID($_GET["documentID"]);
$submissionID = Submission::loadUnfinishedID($documentID);

if (isset($_GET["start"])) {
    if (! Document::isSubmittingAllowed($documentID))
        die("forbidden");

    if (! $submissionID)
        Submission::create($documentID, $_SESSION["userID"]);
    Util::redirect("/views/document.php?documentID={$_GET["documentID"]}&mode=answer");
}

$answers = file_get_contents("php://input");
if (empty($answers))
    $answers = null;
$db = new DB();
$db->execStmt("finishSubmission", $answers, $submissionID);

if ($_GET["documentType"] == "exam")
    Submission::grade($submissionID);
