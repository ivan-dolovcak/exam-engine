<?php
$db = new DB();

// Filter documents by current user.
$query = DB::SQL_QUERIES["loadDocumentsMetadata"]["query"];
$types = DB::SQL_QUERIES["loadDocumentsMetadata"]["types"];

$query .= " where `authorID` = ?";
$types .= "i";

$db->execStmtCustom($query, $types, $_SESSION["userID"]);
$sqlResult = $db->stmt->get_result();
$documents = $sqlResult->fetch_all(MYSQLI_ASSOC);

if (empty($documents)) {
    echo "<p>Nema dokumenta.</p>";
    return;
}
?>
<p>Popis Vaših ispita i obrazaca.</p>

<table>
<tr>
    <th>Naziv</th>
    <th>Tip</th>
    <th>Rok predaje</th>
</tr>

<?php
foreach ($documents as $document) {
    $obfDocumentID = urlencode(Util::obfuscateID($document["ID"]));

    if (! isset($document["deadlineDatetime"]))
        $document["deadlineDatetime"] = "n/a";

    $rowHTML = "<tr>
        <td><a href='/views/document_details.phtml?documentID=$obfDocumentID'>{$document["name"]}</a></td>
        <td>{$document["type"]}</td>
        <td>{$document["deadlineDatetime"]}</td>
    </tr>";

    echo $rowHTML;
}
?>
</table>
