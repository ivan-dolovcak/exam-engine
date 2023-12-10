<?php
class User
{
    public int $ID;
    public string $email;
    public string $passwordHash;
    public string $firstName;
    public string $lastName;
    public DateTime $creationDate;
    public DateTime $lastLoginDatetime;

    private function __construct()
    {

    }

    public static function makeViaRegister(string $email, string $password, 
        string $firstName, string $lastName): self
    {
        require_once "db_controller.php";
        $obj = new self();
        $obj->email = $email;
        $obj->passwordHash = DB::makeHash($password);
        $obj->firstName = $firstName;
        $obj->lastName = $lastName;

        return $obj;
    }

    public static function makeViaLogin(string $email, string $password)
        : self
    {
        require_once "db_controller.php";
        $obj = new self();
        $obj->email = $email;
        $obj->passwordHash = DB::makeHash($password);

        return $obj;
    }

    public function register(): ?string
    {
        // SQL prep
        require_once "db_controller.php";

        $sqlConn = DB::makeSqlConn();
        $sqlStmt = $sqlConn->prepare(DB::$sqlQueries["register"]["query"]);

        $sqlStmt->bind_param(DB::$sqlQueries["register"]["types"], 
            $this->email, $this->passwordHash, $this->firstName, 
            $this->lastName);

        // SQL exec
        try {
            $sqlStmt->execute();
            $regResult = null;
        }
        catch (mysqli_sql_exception) {
            if ($sqlStmt->errno == 1062) // handle duplicate key `email`:
                $regResult = "Greška: e-mail '$this->email' je već zauzet.";
            else
                $regResult = "Greška baze podataka: " . $sqlStmt->error . " #" 
                    . $sqlStmt->errno;
        }
        finally {
            // cleanup
            $sqlStmt->close();
            $sqlConn->close();
            return $regResult;
        }
    }

    public function login(): ?string
    {
        // SQL prep
        require_once "db_controller.php";

        $sqlConn = DB::makeSqlConn();
        $sqlStmt = $sqlConn->prepare(DB::$sqlQueries["login"]["query"]);

        $sqlStmt->bind_param(DB::$sqlQueries["login"]["types"], $this->email);

        // SQL exec
        $sqlStmt->execute();
        $sqlResult = $sqlStmt->get_result();
        $userRow = $sqlResult->fetch_assoc();

        if ($userRow === null)
            return "Greška: pogrešni podaci za prijavu.";

        // Update last login timestamp
        $sqlStmt = $sqlConn->prepare(
            DB::$sqlQueries["touchLastLoginDatetime"]["query"]);
        $sqlStmt->bind_param(DB::$sqlQueries["login"]["types"], $this->email);
        $sqlStmt->execute();
        
        $sqlStmt->close();
        $sqlConn->close();

        // Fetch the rest of user data
        $this->ID = $userRow["ID"];
        $this->firstName = $userRow["firstName"];
        $this->lastName = $userRow["lastName"];
        $this->creationDate = new DateTime($userRow["creationDate"]);
        $this->lastLoginDatetime = new DateTime($userRow["lastLoginDatetime"]);

        $_SESSION["user"] = serialize($this);

        return null;
    }

    public function logout(): void
    {
        unset($_SESSION);
        session_destroy();
    }
}
