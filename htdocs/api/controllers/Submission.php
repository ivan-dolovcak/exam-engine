<?php
class Submission
{
    public static function create(int $documentID, int $userID,
        string $datetimeStart, string $submissionJSON): int
    {
        $db = new DB();
        
        try {
            $db->execStmt("createSubmission", $documentID, $userID, 
                $datetimeStart, $submissionJSON);
            
            return mysqli_insert_id($db->conn);
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

    private static function findAnswerByID(int $ID, array &$answers): object | false
    {
        foreach ($answers as $answer)
            if ($answer->id === $ID)
                return $answer;

        return false;
    }

    public static function grade(int $ID): void
    {
        $submission = json_decode(self::load($ID));
        $submission->documentID = Util::deobfuscateID($submission->documentID);

        $answers = json_decode($submission->submissionJSON);
        
        $solutions = json_decode(
            Document::loadSolutions($submission->documentID)->solutionJSON);

        $grades = [];

        foreach ($solutions as $solution) {
            $answer = self::findAnswerByID($solution->id, $answers);

            if (! $answer)
                $grade = null; // Unanswered questions.
            else if (is_array($solution->value))
                $grade = count(array_intersect($answer->value, $solution->value));
            else
                $grade = intval($solution->value === $answer->value);

            array_push($grades, ["id" => $solution->id, "points" => $grade]);
        }
    }
}
