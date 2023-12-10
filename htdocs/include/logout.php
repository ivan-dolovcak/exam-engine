<?php
session_start();

require_once "user_controller.php";
if (isset($_SESSION["user"]))
    unserialize($_SESSION["user"])->logout();

header("Location: /");
die;
