<?php
class User
{
    private string $email;
    private string $passwordHash;
    private string $firstName;
    private string $lastName;

    public function __construct(string $email, string $passwordHash, 
        string $firstName, string $lastName)
    {
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
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


}
