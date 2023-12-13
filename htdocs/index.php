<?php
session_start();
require_once "util.php";
?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.php"; setPageTitle("Početna"); ?>
</head>
<body>
    <header>
        <?php require_once "header.php"; ?>
    </header>

    <main>
        <h2>O Exam Engine</h2>
        
        <p>Dobro došli na opisnu stranicu usluge Exam Engine!</p>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>
