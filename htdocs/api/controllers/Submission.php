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

    public static function load(int $ID): string
    {
        $db = new DB();

        $db->execStmt("loadSubmission", $ID);
        $sqlResult = $db->stmt->get_result();
        $json = $sqlResult->fetch_assoc();
        // Every ID passed to front-end is obfuscated:
        $json["documentID"] = Util::obfuscateID($json["documentID"]);

        return json_encode($json);
    }
}
