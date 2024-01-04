<?php
/** User controller class. */
class User
{
    public const REGEX_USERNAME_CHECK = "/[^a-z_\.0-9]+/";


    /**
     * Insert a new user into the database.
     *
     * @return false if registration failed (e.g. duplicate key), 'true'
     * otherwise
     */
    public static function register(string $username, string $email, 
        string $password, string $firstName, string $lastName) : bool
    {
        // Check if username is legal
        if (preg_match(User::REGEX_USERNAME_CHECK, $username)) {
            $_SESSION["formMsg"] 
                = "Greška: nedozvoljeni znakovi u korisničkom imenu";
            return false;
        }

        $db = new DB();
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        try {
            $db->execStmt("register", $username, $email, $passwordHash, 
                $firstName, $lastName);
        }
        catch (mysqli_sql_exception $e) {
            // Handle email/username duplicates
            if (str_contains($e->getMessage(), "UK_Username"))
                $_SESSION["formMsg"] = "Greška: korisničko ime '$username'"
                    . " je već zauzeto.";
            else if (str_contains($e->getMessage(), "UK_UserEmail"))
                $_SESSION["formMsg"] = "Greška: e-mail '$email' je već zauzet.";
            else
                $_SESSION["formMsg"]  = "Greška baze podataka: " 
                    . $e->getMessage() . $e->getCode();
            
            return false;
        }

        // Load user ID:
        self::login($username, $password);
        return true;
    }

    /**
     * Login the user via username or email (store the user ID in session).
     * 
     * @return true if logged in successfully, otherwise 'false'
     */
    public static function login(string $usernameOrEmail, string $password) : bool
    {
        $db = new DB();
        $db->execStmt("login", $usernameOrEmail, $usernameOrEmail);

        $sqlResult = $db->stmt->get_result();
        $_SESSION["userID"] = $sqlResult->fetch_assoc()["ID"];
        
        if (! isset($_SESSION["userID"])) {
            $_SESSION["formMsg"] = "Greška: pogrešni podaci za prijavu.";
            return false;
        }
        
        // Update last login timestamp:
        (new DB())->execStmt("touchLastLoginDatetime", $_SESSION["userID"]);
        
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        if(! password_verify($password, $passwordHash)) {
            $_SESSION["formMsg"] = "Greška: pogrešni podaci za prijavu.";
            return false;
        }

        // Set/update login cookie (used for dynamic nav link):
        setcookie("exam_engine_login", "_", strtotime("+30 days"), "/");

        return true;
    }

    /**
     * Load a user record from DB.
     */
    public static function load(int $ID) : array
    {
        $db = new DB();
        $db->execStmt("loadUser", $ID);
        
        $sqlResult = $db->stmt->get_result();
        return $sqlResult->fetch_assoc();
    }
}
