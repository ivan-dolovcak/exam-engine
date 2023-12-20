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
    public ?string $errMsg;
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

    public function register() : bool
    {
        // Check if username is legal:
        if (preg_match(User::REGEX_USERNAME_CHECK, $this->username)) {
            $this->errMsg = "Greška: nedozvoljeni znakovi u korisničkom imenu";
            return false;
        }

        $db = new DB();

        try {
            $db->execStmt("register", $this->username, $this->email,
                $this->passwordHash, $this->firstName, $this->lastName);
            return true;
        }
        catch (mysqli_sql_exception $e) {
            // Handle email/username duplicate:
            if (str_contains($e->getMessage(), "UK_Username"))
                $this->errMsg = "Greška: korisničko ime '$this->username'"
                    . " je već zauzeto.";
            else if (str_contains($e->getMessage(), "UK_UserEmail"))
                $this->errMsg = "Greška: e-mail '$this->email' je već zauzet.";
            else
                $this->errMsg = "Greška baze podataka: " . $e->getMessage()
                    . $e->getCode();
            
            return false;
        }
    }

    public function login(string $usernameOrEmail, string $password) : bool
    {
        $db = new DB();
        $db->execStmt("login", $usernameOrEmail, $usernameOrEmail);

        $sqlResult = $db->stmt->get_result();
        $userRow = $sqlResult->fetch_assoc();

        if (! isset($userRow)) {
            $this->errMsg = "Greška: pogrešni podaci za prijavu.";
            return false;
        }

        // Update last login timestamp:
        (new DB())->execStmt("touchLastLoginDatetime", $userRow["ID"]);

        // Read all remaining attributes:
        $this->loadUser($userRow["ID"]);

        if(! password_verify($password, $this->passwordHash)) {
            $this->errMsg = "Greška: pogrešni podaci za prijavu.";
            return false;
        }

        // Save the User object in the session:
        $_SESSION["user"] = serialize($this);

        // Set/update login cookie (used for dynamic nav link):
        setcookie("exam_engine_login", "_", strtotime("+30 days"), "/");

        return true;
    }

    private function loadUser(int $ID) : void
    {
        $db = new DB();
        $db->execStmt("loadUser", $ID);
        
        $sqlResult = $db->stmt->get_result();
        $userRow = $sqlResult->fetch_assoc();

        foreach ($userRow as $column => $value) {
            if (preg_match("/Date/", $column))
                $value = new DateTime($value);

            $this->$column = $value;
        }
    }
}
