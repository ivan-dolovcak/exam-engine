<?php
class User
{
    public int $ID;
    public string $username;
    public string $email;
    public string $passwordHash;
    public string $firstName;
    public string $lastName;
    public DateTime $creationDate;
    public DateTime $lastLoginDatetime;

    public const REGEX_USERNAME_CHECK = "/[^a-z_\.0-9]+/";

    public static function ctorViaRegister(string $username, string $email, 
        string $password, string $firstName, string $lastName) : self
    {
        $obj = new self();
        $obj->username = $username;
        $obj->email = $email;
        $obj->passwordHash = DB::makeHash($password);
        $obj->firstName = $firstName;
        $obj->lastName = $lastName;

        return $obj;
    }

    public static function ctorViaSessionVar() : ?self
    {
        if (isset($_SESSION["user"]))
            return unserialize($_SESSION["user"]);
        else
            return null;
    }

    public function register() : ?string
    {
        // Check if username is legal:
        if (preg_match(User::REGEX_USERNAME_CHECK, $this->username)) {
            $regResult = "Greška: nedozvoljeni znakovi u korisničkom imenu";
            return $regResult;
        }

        $sqlConn = DB::makeSqlConn();
        $sqlStmt = $sqlConn->prepare(DB::$sqlQueries["register"]["query"]);

        $sqlStmt->bind_param(DB::$sqlQueries["register"]["types"], 
            $this->username, $this->email, $this->passwordHash,
            $this->firstName, $this->lastName);

        try {
            $sqlStmt->execute();
            $regResult = null;
        }
        catch (mysqli_sql_exception) {
            // Handle email/username duplicate:
            if ($sqlStmt->errno == 1062) {
                if (str_contains($sqlStmt->error, "UK_Username"))
                    $regResult = "Greška: korisničko ime '$this->username'"
                        . " je već zauzeto.";
                else
                    $regResult = "Greška: e-mail '$this->email' je već zauzet.";
            }
            else
                $regResult = "Greška baze podataka: " . $sqlStmt->error . " #" 
                    . $sqlStmt->errno;
        }
        finally {
            $sqlStmt->close();
            $sqlConn->close();

            return $regResult;
        }
    }

    public function login(string $usernameOrEmail, string $password) : ?string
    {
        $sqlConn = DB::makeSqlConn();
        $sqlStmt = $sqlConn->prepare(DB::$sqlQueries["login"]["query"]);

        $sqlStmt->bind_param(DB::$sqlQueries["login"]["types"],
            $usernameOrEmail, $usernameOrEmail);

        $sqlStmt->execute();
        $sqlResult = $sqlStmt->get_result();
        $userRow = $sqlResult->fetch_assoc();

        if (! isset($userRow))
            return "Greška: pogrešni podaci za prijavu.";

        $this->loadUser($userRow["ID"]);

        if(! password_verify($password, $this->passwordHash))
            return "Greška: pogrešni podaci za prijavu.";

        // Update last login timestamp
        $sqlStmt = $sqlConn->prepare(
            DB::$sqlQueries["touchLastLoginDatetime"]["query"]);
        $sqlStmt->bind_param(
            DB::$sqlQueries["touchLastLoginDatetime"]["types"], $userRow["ID"]);
        $sqlStmt->execute();
        
        $sqlStmt->close();
        $sqlConn->close();

        // Save the User object in the session:
        $_SESSION["user"] = serialize($this);

        // Set login cookie (used for dynamic nav link):
        setcookie("exam_engine_login", "_", strtotime("+30 days"), "/");

        return null; // No error message -> login successful
    }

    private function loadUser(int $ID) : void
    {
        $sqlConn = DB::makeSqlConn();
        $sqlStmt = $sqlConn->prepare(DB::$sqlQueries["loadUser"]["query"]);

        $sqlStmt->bind_param(DB::$sqlQueries["loadUser"]["types"], $ID);

        $sqlStmt->execute();
        $sqlStmt->close();
        $sqlConn->close();
        
        $sqlResult = $sqlStmt->get_result();
        $userRow = $sqlResult->fetch_assoc();

        foreach ($userRow as $column => $value) {
            if (preg_match("/Date/", $column))
                $value = new DateTime($value);

            $this->$column = $value;
        }
    }
}
