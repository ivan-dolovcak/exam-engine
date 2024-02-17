<?php
class Submission
{
    public static function create(int $documentID, int $userID): int
    {
        $db = new DB();
        
        try {
            $db->execStmt("createSubmission", $documentID, $userID);
            
            return $db->conn->insert_id;
        }
        catch (mysqli_sql_exception $e) {
            $_SESSION["formMsg"] = "Greška baze podataka: " . $e->getMessage() 
                . $e->getCode();

            return false;
        }
    }

    public static function finish(string $submissionJSON): void
    {
        $db = new DB();
        $db->execStmt("finishSubmission", $submissionJSON);
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

    public static function loadUnfinishedID(int $documentID): int | false
    {
        $db = new DB();
        $db->execStmt("loadUnfinishedSubmittionID", $documentID, $_SESSION["userID"]);
        $result = $db->stmt->get_result()->fetch_assoc();
        if (empty($result))
            return false;

        return $result["ID"];
    }

    private static function findByID(int $ID, array &$array): object | false
    {
        foreach ($array as $answer)
            if ($answer->ID === $ID)
                return $answer;

        return false;
    }

    public static function grade(int $ID): void
    {
        $submission = json_decode(self::load($ID));
        $submission->documentID = Util::deobfuscateID($submission->documentID);

        $document = json_decode(Document::load($submission->documentID));
        $questions = json_decode($document->documentJSON);

        $answers = json_decode($submission->submissionJSON);
        
        $solutions = json_decode(
            Document::loadSolution($submission->documentID)->solutionJSON);

        $grades = [];
        $correctPoints = 0;

        foreach ($solutions as $solution) {
            $question = self::findByID($solution->ID, $questions);
            // Don't auto-grade questions which need manual grading:

            if (isset($question->needsManualGrading) 
                && $question->needsManualGrading)
                continue;

            $answer = self::findByID($solution->ID, $answers);

            if (! $answer)
                $grade = null; // Unanswered questions.
            else if ($question->type === "multiChoice") {
                $answer->value = array_filter($answer->value, fn($val) => $val != null);
                $grade = count(array_intersect($answer->value, $solution->value));
                $grade -= count(array_diff($answer->value, $solution->value));
            }
            else if ($question->type === "fillIn") {
                $grade = 0;
                for ($i = 0; $i < count($solution->value); ++$i)
                    if ($solution->value[$i] === $answer->value[$i])
                        $grade++;
            }
            else
                $grade = intval($solution->value === $answer->value);

            $correctPoints += $grade;
            array_push($grades, ["ID" => $solution->ID, "points" => $grade]);
        }

        $db = new DB();
        $db->execStmt("addSubmissionGrading", json_encode($grades), 
            $correctPoints, $submission->ID);
    }
}
