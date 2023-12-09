<?php
# This is the global auto prepend file.

declare(strict_types=1);
set_include_path($_SERVER["DOCUMENT_ROOT"] . "/include");

if ($_SERVER["DEVELOPMENT"] == "true") {
    error_reporting(E_ALL);
    ini_set("display_errors", true);
    ini_set("display_startup_errors", true);
}
