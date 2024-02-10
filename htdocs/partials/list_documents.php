<?php
$db = new DB();
$db->execStmt("loadDocumentsMetadata", $_SESSION["userID"]);
$sqlResult = $db->stmt->get_result();
$documents = $sqlResult->fetch_all(MYSQLI_ASSOC);

if (empty($documents)) {
    echo "<p>Nema dokumenta.</p>";
    return;
}
?>

<table>
<tr>
    <th>Naziv</th>
    <th>Tip</th>
    <th>Rok predaje</th>
    <th>Kreiran</th>
    <th></th>
    <th></th>
</tr>

<?php
foreach ($documents as $document) {
    $obfDocumentID = urlencode(Util::obfuscateID($document["ID"]));

    if (! isset($document["deadlineDatetime"]))
        $document["deadlineDatetime"] = "n/a";

    $rowHTML = "<tr>
        <td>{$document["name"]}</td>
        <td>{$document["type"]}</td>
        <td>{$document["deadlineDatetime"]}</td>
        <td>{$document["creationDate"]}</td>
        <td><button onclick='location.href=\"/views/document.php?documentID=$obfDocumentID&mode=answer\"'>Riješi</button></td>
        <td><button onclick='location.href=\"/views/document.php?documentID=$obfDocumentID&mode=edit\"'>Uredi</button></td>
    </tr>";

    echo $rowHTML;
}
?>
</table>
