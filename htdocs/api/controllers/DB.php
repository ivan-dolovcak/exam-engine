<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require ".sql_auth.php";

/** App database controller class. */
class DB
{
    /**
     * 2D array containing all SQL queries and the corresponding type strings
     * used for prepared statements.
     */
    public const SQL_QUERIES = [
    // Loading
        "login" => [
            "query" => "
                select `ID` from `User`
                where `email` = ? or `username` = ?",
            "types" => "ss"
        ],
        "loadUser" => [
            "query" => "
                select * from `User`
                where `ID` = ?",
            "types" => "i"
        ],
        "loadSubmission" => [
            "query" => "
                select * from `Submission`
                where `ID` = ?",
            "types" => "i"
        ],
        "loadSubmissionsMetadata" => [ // dynamic
            "query" => "
                select s.`ID`, `datetimeStart`, `datetimeEnd`, d.`name`, d.`type`, `correctPoints`,
                       concat(u.`firstName`, ' ', u.`lastName`) as `fullName`,
                       timediff(`datetimeEnd`, `datetimeStart`) as `solvingDuration`
                from `Submission` as s
                inner join `Document` as d
                on d.`ID` = s.`documentID`
                inner join `User` as u
                on u.`ID` = s.`userID`",
            "types" => ""
        ],
        "loadDocumentsMetadata" => [ // dynamic
            "query" => "
                select  `ID`, `name`, `type`, `visibility`, `passwordHash`, 
                        `numMaxSubmissions`, `authorID`, `deadlineDatetime`,
                        `creationDate`,
                        json_length(documentJSON) as `numQuestions`,
                        json_extract(documentJSON, '$[*].points') as `points`
                from `Document`",
            "types" => ""
        ],
        "loadDocument" => [
            "query" => "
                select * from `Document`
                where `ID` = ?",
            "types" => "i"
        ],
        "loadDocumentSolution" => [
            "query" => "
                select `solutionJSON` from `Document`
                where `ID` = ?",
            "types" => "i"
        ],
        "loadUnfinishedSubmittionID" => [
            "query" => "
                select `ID` from `Submission`
                where `datetimeEnd` is null
                      and `documentID` = ?
                      and `userID` = ?",
            "types" => "ii"
        ],
    // Statistics
        "getNumSubmissionsLeft" => [
            "query" => "
                select (cast(d.`numMaxSubmissions` as signed) - count(*)) as `numSubmissions`
                from `Submission` as s
                inner join `Document` as d
                    on d.`ID` = s.`documentID`
                where `documentID` = ? 
                      and `userID` = ?
            ",
            "types" => "ii"
        ],
    // Inserting
        "register" => [
            "query" => "
                insert into `User`(`username`, `email`, `passwordHash`,
                                   `firstName`, `lastName`)
                values(?, ?, ?, ?, ?)",
            "types" => "sssss"
        ],
        "createDocument" => [
            "query" => "
                insert into `Document`(`name`, `type`, `passwordHash`, 
                                       `authorID`, `deadlineDatetime`)
                values(?, ?, ?, ?, ?)",
            "types" => "sssis"
        ],
        "createSubmission" => [
            "query" => "
                insert into `Submission`(`documentID`, `userID`)
                values(?, ?)",
            "types" => "ii"
        ],
    // Updating
        "finishSubmission" => [
            "query" => "
                update `Submission`
                set `submissionJSON` = ?,
                    `datetimeEnd` = utc_timestamp()
                where `ID` = ?
            ",
            "types" => "si"
        ],
        "addSubmissionGrading" => [
            "query" => "
                update `Submission`
                set `gradingJSON` = ?, `correctPoints` = ?
                where `ID` = ?",
            "types" => "sii"
        ],
        "touchLastLoginDatetime" => [
            "query" => "
                update `User`
                set `lastLoginDatetime` = utc_timestamp()
                where `ID`= ?",
            "types" => "i"
        ],
        "updateSolution" => [
            "query" => "
                update `Document`
                set `solutionJSON` = ?
                where `ID` = ?
            ",
            "types" => "si"
        ],
        "updateDocument" => [
            "query" => "
                update `Document`
                set `documentJSON` = ?
                where `ID` = ?
            ",
            "types" => "si"
        ]
    ];

    public readonly mysqli $conn;
    // Using prepared statements as basic protection against SQL injection:
    public mysqli_stmt $stmt;
    
    
    /** Create a connection to the database. */
    public function __construct()
    {
        try {
            $this->conn = new mysqli(
                SQL_HOSTNAME, SQL_USERNAME, SQL_PASSWORD, SQL_DATABASE);
        }
        catch (mysqli_sql_exception $e) {
            // TODO: user-friendly error reporting
            echo "Greška baze podataka: ", $e->getMessage(), "#", $e->getCode();
            die;
        }
    }

    /**
     * Create and execute a prepared statement.
     * 
     * @param string $queryName     query's name in the `SQL_QUERIES` array
     * @param mixed ...$queryArgs   args to bind to the statement query
     */
    public function execStmt(string $queryName, mixed ...$queryArgs): void
    {
        $query = self::SQL_QUERIES[$queryName]["query"];
        $types = self::SQL_QUERIES[$queryName]["types"];
        
        self::execStmtCustom($query, $types, ...$queryArgs);
    }

    public function execStmtCustom(
        string $query, string $types, mixed ...$queryArgs): void
    {
        $this->stmt = $this->conn->prepare($query);
        if (! empty($types))
            $this->stmt->bind_param($types, ...$queryArgs);
        $this->stmt->execute();
    }

    /**
     * Close statement and connection to database automatically when the object
     * is destroyed.
     */
    public function __destruct()
    {
        if (isset($this->stmt))
            $this->stmt->close();
        $this->conn->close();
    }
}
