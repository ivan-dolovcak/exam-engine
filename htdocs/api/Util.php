<?php
class Util
{
    // This is a static class:
    private function __construct() { }

    public static function redirect(string $url) : void
    {
        header("Location: $url");
        die;
    }

    public static function previousPage() : void
    {
        echo "<script>history.back();</script>";
        die;
    }

    public static function getFormMsg() : string
    {
        $formMsg = isset($_SESSION["formMsg"]) ? $_SESSION["formMsg"] : "";

        // Clear message on page refresh
        if ($_SERVER["REQUEST_METHOD"] !== "POST")
            unset($_SESSION["formMsg"]);

        return $formMsg;
    }

    public static function getAppVersion() : string
    {
        $versionFile = $_SERVER["DOCUMENT_ROOT"] . "/.app_version";

        if (file_exists($versionFile))
            return file_get_contents($versionFile);
        else
            return "[app version unknown]";
    }

    public static function sanitizeFormInput(string $input) : string
    {
        $input = trim($input);
        $input = htmlspecialchars($input);
        
        return $input;
    }
}
