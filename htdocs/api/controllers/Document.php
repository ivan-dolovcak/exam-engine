<?php
class Document
{
    public static function create(string $name, string $type, 
        ?string $passwordHash, int $authorID, ?string $deadline) : bool
    {
        $db = new DB();
        
        try {
            $db->execStmt("createDocument", $name, $type, $passwordHash,
                $authorID, $deadline);
        }
        catch (mysqli_sql_exception $e) {
            $_SESSION["formMsg"] = "Greška baze podataka: " . $e->getMessage() 
            . $e->getCode();
        }

        return true;
    }
}
