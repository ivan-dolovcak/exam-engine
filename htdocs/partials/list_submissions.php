<?php
$db = new DB();
$db->execStmt("loadSubmissionsMetadata", $_SESSION["userID"]);
$sqlResult = $db->stmt->get_result();
$submissions = $sqlResult->fetch_all(MYSQLI_ASSOC);

if (empty($submissions))
    echo "<p>Nema rješenja.</p>";

foreach ($submissions as $submission) {
    echo "<div class='document-box'>";
    $type = $submission["type"] == "exam" ? "ispit" : "obrazac";
    echo "<h4>{$submission["name"]} [$type]</h4>";

    echo "<p>Predano {$submission["datetimeEnd"]}.</p>";

    $obfSubmissionID = urlencode(Util::obfuscateID($submission["ID"]));
    echo "<a href='/views/document.php?submissionID=$obfSubmissionID'>
        Otvori</a>";

    echo "</div>";
}
