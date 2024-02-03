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

    private static function findById(int $ID, array &$array): object | false
    {
        foreach ($array as $answer)
            if ($answer->id === $ID)
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
            Document::loadSolutions($submission->documentID)->solutionJSON);

        $grades = [];

        foreach ($solutions as $solution) {
            $question = self::findById($solution->id, $questions);
            // Don't auto-grade questions which need manual grading:

            if (isset($question->needsManualGrading) 
                && $question->needsManualGrading)
                continue;

            $answer = self::findById($solution->id, $answers);

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

            array_push($grades, ["id" => $solution->id, "points" => $grade]);
        }

        $db = new DB();
        $db->execStmt("addSubmissionGrading", json_encode($grades),
            $submission->ID);
    }
}
