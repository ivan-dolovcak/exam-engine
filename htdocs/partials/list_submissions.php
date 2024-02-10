<?php
$db = new DB();
$db->execStmt("loadSubmissionsMetadata", $_SESSION["userID"]);
$sqlResult = $db->stmt->get_result();
$submissions = $sqlResult->fetch_all(MYSQLI_ASSOC);

if (empty($submissions)) {
    echo "<p>Nema dokumenta.</p>";
    return;
}
?>

<table>
<tr>
    <th>Naziv</th>
    <th>Tip</th>
    <th>Kraj</th>
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
        <td>{$submission["datetimeEnd"]}</td>
        <td><button onclick='location.href=\"/views/document.php?submissionID=$obfSubmissionID&mode=review\"'>Vidi</button></td>
    </tr>";

    echo $rowHTML;
}
?>
</table>
