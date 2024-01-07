<?php
$db = new DB();
$db->execStmt("loadDocumentsMetadata", $_SESSION["userID"]);
$sqlResult = $db->stmt->get_result();
$documents = $sqlResult->fetch_all(MYSQLI_ASSOC);

if (empty($documents))
    echo "<p>Nema dokumenta.</p>";

foreach ($documents as $document) {
    echo "<div class='document-box'>";
    $type = $document["type"] == "exam" ? "ispit" : "obrazac"; 
    echo "<h4>{$document["name"]} [$type]</h4>";

    echo "<p>Dodan {$document["creationDate"]}.</p>";
    if (isset($document["passwordHash"]))
        echo "<p>Zahtjeva lozinku.";
    if (isset($document["deadlineDatetime"]))
        echo "<p>Rok predaje: {$document["deadlineDatetime"]}</p>";

    $obfDocumentID = urlencode(Util::obfuscateID($document["ID"]));
    echo "<a href='/views/document.php?ID=$obfDocumentID'>
        Otvori</a> ";
    echo "<a href='/views/document.php?ID=$obfDocumentID?mode=edit'>
        Uredi</a>";

    echo "</div>";
}
