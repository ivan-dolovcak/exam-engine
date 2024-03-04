<?php
/**
 * Document/submission JSON data received via fetch().
 */

session_start();

if (isset($_GET["documentID"])) {
    $documentID = Util::deobfuscateID($_GET["documentID"]);

    $document = Document::load($documentID);
    echo json_encode($document);
}
else if (isset($_GET["submissionID"])) {
    $submissionID = Util::deobfuscateID($_GET["submissionID"]);
    $submissionJSON = Submission::load($submissionID);
    echo $submissionJSON;
}
else
    die("forbidden");
