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

    public static function load(int $ID): string
    {
        $db = new DB();

        $db->execStmt("loadDocument", $ID);
        $sqlResult = $db->stmt->get_result();
        $json = $sqlResult->fetch_assoc();

        return json_encode($json);
    }

    public static function loadSolutions(int $ID): object
    {
        $db = new DB();
        $db->execStmt("loadDocumentSolutions", $ID);
        
        $sqlResult = $db->stmt->get_result();
        return $sqlResult->fetch_object();
    }
}
