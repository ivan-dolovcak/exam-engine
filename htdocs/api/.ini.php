<?php
// This is the global auto prepend script.
declare(strict_types=1);

/* During development (v0.x.x), errors are shown locally and on the production
 * server. After v1.0.0, use e.g.:
 * if (isset($_SERVER["DEVELOPMENT"])) { ... }
 */
error_reporting(E_ALL);
ini_set("display_errors", true);
ini_set("display_startup_errors", true);

date_default_timezone_set("UTC");

set_include_path(implode(":", array(
    $_SERVER["DOCUMENT_ROOT"] . "/partials",
    $_SERVER["DOCUMENT_ROOT"] . "/api",
    $_SERVER["DOCUMENT_ROOT"] . "/api/controllers",
)));

/* Auto-require class definitions.
 * "require" used instead of "require_once" because "sql_auto_register" already
 * checks if class exists, so checking again via "require_once" is redundant.
 */
spl_autoload_register(fn($className) => require "$className.php");
