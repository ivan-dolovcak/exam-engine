<?php
/** Class for commonly used utility functions. */
class Util
{
    /** Only static methods in this class, so no need for instantiating. */
    private function __construct() { }

    /** Send a redirect header and end the script. */
    public static function redirect(string $url): void
    {
        header("Location: $url");
        die;
    }

    /** Go to previous page by echoing JS. */
    public static function previousPage(): void
    {
        echo "<script>history.back();</script>";
        die;
    }

    /** Get form error message and delete it on page refresh. */
    public static function getFormMsg(): string
    {
        $formMsg = isset($_SESSION["formMsg"]) ? $_SESSION["formMsg"] : "";

        if ($_SERVER["REQUEST_METHOD"] !== "POST")
            unset($_SESSION["formMsg"]);

        return $formMsg;
    }

    /** Read the app version from a file. */
    public static function getAppVersion(): string
    {
        $versionFile = $_SERVER["DOCUMENT_ROOT"] . "/.app_version";

        if (file_exists($versionFile))
            return file_get_contents($versionFile);
        else
            return "[app version unknown]";
    }

    /**
     * Basic protection against XSS.
     * 
     * @param string $input     raw form input
     * @return string           sanitized string
     */
    public static function sanitizeFormInput(string $input): string
    {
        $input = trim($input);
        $input = stripslashes($input);
        $input = htmlspecialchars($input);
        
        return $input;
    }

    public static function obfuscateID(int $ID): string
    {
        srand($ID);
        $key = rand(1000, 9999);
        return $key . dechex($ID ^ $key);
    }
    
    public static function deobfuscateID(string $obfuscatedID): int
    {
        $key = intval(substr($obfuscatedID, 0, 4));
        return hexdec(substr($obfuscatedID, 4)) ^ $key;
    }
}
