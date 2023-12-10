<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

class DB
{
    private static $sqlAuth;

    public static $sqlQueries = [
        "register" => [
            "query" => "insert into `User`
                        values (default, ?, ?, ?, ?, default, default);",
            "types" => "ssss"
        ],
        "login" => [
            "query" => "select * from `User`
                        where `email`=?;",
            "types" => "s"
        ],
        "touchLastLoginDatetime" => [
            "query" => "update `User`
                        set `lastLoginDatetime` = current_timestamp()
                        where `email`=?;",
            "types" => "s"
        ],
    ];

    private static function readSqlAuth(): mixed
    {
        $sqlAuthPath = $_SERVER["DOCUMENT_ROOT"] . "/.server";
        if (isset($_SERVER["DEVELOPMENT"]))
            $sqlAuthPath .= "/.auth.template.json";
        else
            $sqlAuthPath .= "/.auth.json";

        $sqlAuth = json_decode(file_get_contents($sqlAuthPath))->sql;

        if ($sqlAuth === null)
            throw new Exception("Error decoding JSON: " + json_last_error_msg());

        return $sqlAuth;
    }

    public static function makeSqlConn(): mysqli
    {
        if (! isset(self::$sqlAuth))
            self::$sqlAuth = self::readSqlAuth();
        
        $sqlConn = new mysqli(self::$sqlAuth->hostname, self::$sqlAuth->username, 
            self::$sqlAuth->password, self::$sqlAuth->database);

        if ($sqlConn->connect_errno) {
            printf("SQL connection failed: %s\n", $sqlConn->connect_error);
            die;
        }

        return $sqlConn;
    }

    public static function makeHash(string $raw): string
    {
        return password_hash($raw, PASSWORD_BCRYPT);
    }
}
