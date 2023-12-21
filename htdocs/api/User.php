<?php
/** User controller class. */
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
    /** The error message from register/login process. */
    public ?string $errMsg;
    public const REGEX_USERNAME_CHECK = "/[^a-z_\.0-9]+/";

    /**
     * Prepare for user registration.
     *
     * 'login()' has to be called later for other attributes to be assigned.
     */
    public static function ctorViaRegister(string $username, string $email, 
        string $password, string $firstName, string $lastName) : self
    {
        $obj = new self();
        $obj->username = $username;
        $obj->email = $email;
        $obj->passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $obj->firstName = $firstName;
        $obj->lastName = $lastName;

        return $obj;
    }

    /**
     * Get the current logged in User object by unserializing the session var.
     * 
     * @return User the current User object
     * @return null if user isn't logged in
     */
    public static function ctorGetCurrentUser() : ?self
    {
        if (isset($_SESSION["user"]))
            return unserialize($_SESSION["user"]);
        else
            return null;
    }

    /**
     * Insert a new user into the database.
     *
     * @return false if registration failed (e.g. duplicate key), 'true'
     * otherwise
     */
    public function register() : bool
    {
        // Check if username is legal
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
            // Handle email/username duplicates
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

    /**
     * Login the user via username or email. 
     * 
     * If a user with specified login info is found, all attributes are loaded
     * from the database into the object. The object is stored in a session
     * variable.
     * 
     * @return true if logged in successfully, otherwise 'false'
     */
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

        /* Save the User object in the session, instead of reading from the
         * database every time User attributes are needed:
         */
        $_SESSION["user"] = serialize($this);

        // Set/update login cookie (used for dynamic nav link):
        setcookie("exam_engine_login", "_", strtotime("+30 days"), "/");

        return true;
    }

    /**
     * Load all User attributes from database into the object.
     * 
     * @param int $ID user ID (primary key)
     */
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
