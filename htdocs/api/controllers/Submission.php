<?php
class Submission
{
    public static function create(int $documentID, int $userID,
        string $datetimeStart, string $submissionJSON): bool
    {
        $db = new DB();
        
        try {
            $db->execStmt("createSubmission", $documentID, $userID, 
                $datetimeStart, $submissionJSON);
            
            return true;
        }
        catch (mysqli_sql_exception $e) {
            $_SESSION["formMsg"] = "Greška baze podataka: " . $e->getMessage() 
                . $e->getCode();

            return false;
        }
    }
}
