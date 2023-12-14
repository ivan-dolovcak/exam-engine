<?php
session_start();

session_unset();
session_destroy();

Util::redirect("/");
