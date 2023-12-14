<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require ".sql_auth.php";

class DB
{
    // This is a static class:
    private function __construct() { }

    public static $sqlQueries = [
        "register" => [
            "query" => "insert into `User`
                        values (default, ?, ?, ?, ?, ?, default, default);",
            "types" => "sssss"
        ],
        "login" => [
            "query" => "select * from `User`
                        where `email` = ?;",
            "types" => "s"
        ],
        "touchLastLoginDatetime" => [
            "query" => "update `User`
                        set `lastLoginDatetime` = current_timestamp()
                        where `email`= ?;",
            "types" => "s"
        ],
    ];

    public static function makeSqlConn() : mysqli
    {
        $sqlConn = new mysqli(SQL_HOSTNAME, SQL_USERNAME, SQL_PASSWORD, 
            SQL_DATABASE);

        if ($sqlConn->connect_errno) {
            echo "Greška baze podataka: ", $sqlConn->error, " #",
                $sqlConn->errno;
            die;
        }

        return $sqlConn;
    }

    public static function makeHash(string $raw) : string
    {
        return password_hash($raw, PASSWORD_BCRYPT);
    }
}
