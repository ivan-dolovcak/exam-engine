<?php
session_start();

session_unset();
session_destroy();

require_once "util.php";
Util::redirect("/");
