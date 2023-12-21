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
        "register" => [
            "query" => "insert into `User`
                        values (default, ?, ?, ?, ?, ?, default, default);",
            "types" => "sssss"
        ],
        "login" => [
            "query" => "select `ID` from `User`
                        where `email` = ? or `username` = ?;",
            "types" => "ss"
        ],
        "loadUser" => [
            "query" => "select * from `User`
                        where `ID` = ?;",
            "types" => "i"
        ],
        "touchLastLoginDatetime" => [
            "query" => "update `User`
                        set `lastLoginDatetime` = utc_timestamp()
                        where `ID`= ?;",
            "types" => "i"
        ],
    ];

    public readonly mysqli $conn;
    // Using prepared statements as basic protection against SQL injection:
    public readonly mysqli_stmt $stmt;
    
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
     * @param array ...$queryArgs   args to bind to the statement query
     */
    public function execStmt(string $queryName, array ...$queryArgs) : void
    {
        $queryPair = self::SQL_QUERIES[$queryName];
        $this->stmt = $this->conn->prepare($queryPair["query"]);
        $this->stmt->bind_param($queryPair["types"], ...$queryArgs);
        $this->stmt->execute();
    }

    /**
     * Close statement and connection to database automatically when the object
     * is destroyed.
     */
    public function __destruct()
    {
        $this->stmt->close();
        $this->conn->close();
    }
}
