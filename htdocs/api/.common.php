<?php
// This is the global auto prepend file.
declare(strict_types=1);

set_include_path(implode(":", array(
    $_SERVER["DOCUMENT_ROOT"] . "/include",
    $_SERVER["DOCUMENT_ROOT"] . "/api")
));

// During development (v0.x.x), errors are shown locally and on the production
// server. After v1.0.0, use e.g.:
// if (isset($_SERVER["DEVELOPMENT"]) || true) { ... }
error_reporting(E_ALL);
ini_set("display_errors", true);
ini_set("display_startup_errors", true);
