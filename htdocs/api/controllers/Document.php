<?php
class Document
{
    public static function create(string $name, string $type, 
        ?string $passwordHash, int $authorID, ?string $deadline): bool
    {
        $db = new DB();
        
        try {
            $db->execStmt("createDocument", $name, $type, $passwordHash,
                $authorID, $deadline);

            return true;
        }
        catch (mysqli_sql_exception $e) {
            $_SESSION["formMsg"] = "Greška baze podataka: " . $e->getMessage() 
            . $e->getCode();

            return false;
        }
    }

    public static function loadJSON(int $ID): string
    {
        $db = new DB();

        $db->execStmt("loadDocumentContent", $ID);
        $sqlResult = $db->stmt->get_result();
        $json = $sqlResult->fetch_array();

        return json_encode($json[0]);
    }
}
