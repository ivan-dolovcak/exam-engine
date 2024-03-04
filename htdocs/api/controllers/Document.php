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

    public static function getNumSubmissionsLeft(int $ID): ?int
    {
        $db = new DB();
        $db->execStmt("getNumSubmissionsLeft", $ID, $_SESSION["userID"]);
        $numSubmissions = $db->stmt->get_result()->fetch_array()["numSubmissions"];

        return $numSubmissions;
    }

    public static function isSubmittingAllowed(int $ID): bool
    {
        $document = self::load($ID);

        if (isset($document->deadlineDatetime)
                && time() > strtotime($document->deadlineDatetime))
            return false;
        if ($document->authorID === $_SESSION["userID"]
                && $document->visibility !== "public")
            return false;
        if (Submission::loadUnfinishedID($ID))
            return true;
        if ((self::getNumSubmissionsLeft($ID)) === 0)
            return false;

        return true;
    }

    public static function load(int $ID): object
    {
        $db = new DB();

        $db->execStmt("loadDocument", $ID);
        $sqlResult = $db->stmt->get_result();
        $document = $sqlResult->fetch_object();

        return $document;
    }

    public static function loadSolution(int $ID): object
    {
        $db = new DB();
        $db->execStmt("loadDocumentSolution", $ID);
        
        $sqlResult = $db->stmt->get_result();
        return $sqlResult->fetch_object();
    }
}
