<?php
$db = new DB();

// Filter documents by current user.
$query = DB::SQL_QUERIES["loadSubmissionsMetadata"]["query"];
$types = DB::SQL_QUERIES["loadSubmissionsMetadata"]["types"];

$query .= " where `userID` = ?";
$types .= "i";

$db->execStmtCustom($query, $types, $_SESSION["userID"]);
$sqlResult = $db->stmt->get_result();
$submissions = $sqlResult->fetch_all(MYSQLI_ASSOC);

if (empty($submissions)) {
    echo "<p>Nema rješenja.</p>";
    return;
}
?>

<table>
<tr>
    <th>Naziv</th>
    <th>Tip</th>
    <th>Bodovi</th>
    <th>Početak</th>
    <th></th>
</tr>

<?php
foreach ($submissions as $submission) {
    $obfSubmissionID = urlencode(Util::obfuscateID($submission["ID"]));

    if (! isset($document["deadlineDatetime"]))
        $document["deadlineDatetime"] = "n/a";

    $rowHTML = "<tr>
        <td>{$submission["name"]}</td>
        <td>{$submission["type"]}</td>
        <td>{$submission["correctPoints"]}</td>
        <td>{$submission["datetimeStart"]}</td>
        <td><button onclick='location.href=\"/views/document.php?submissionID=$obfSubmissionID&mode=review\"'>Vidi</button></td>
    </tr>";

    echo $rowHTML;
}
?>
</table>
