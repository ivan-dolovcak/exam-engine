<?php
$documentID = Util::deobfuscateID($_GET["documentID"]);

$response = file_get_contents("php://input");

$db = new DB();
$db->execStmt("updateDocument", $response, $documentID);
die;
