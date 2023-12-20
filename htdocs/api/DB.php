<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require ".sql_auth.php";

class DB
{
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
    // Using prepared statements as basic protection against SQL injection
    public readonly mysqli_stmt $stmt;
    

    public function __construct()
    {
        try {
            $this->conn = new mysqli(SQL_HOSTNAME, SQL_USERNAME, SQL_PASSWORD,
                SQL_DATABASE);
        }
        catch (mysqli_sql_exception $e) {
            // TODO: user-friendly error reporting
            echo "Greška baze podataka: ", $e->getMessage(), "#", $e->getCode();
            die;
        }
    }

    public function execStmt(string $queryName = null, mixed ...$queryArgs)
    {
        $queryPair = self::SQL_QUERIES[$queryName];
        $this->stmt = $this->conn->prepare($queryPair["query"]);
        $this->stmt->bind_param($queryPair["types"], ...$queryArgs);
        $this->stmt->execute();
    }

    public static function makeHash(string $raw) : string
    {
        return password_hash($raw, PASSWORD_BCRYPT);
    }

    public function __destruct()
    {
        $this->stmt->close();
        $this->conn->close();
    }
}
