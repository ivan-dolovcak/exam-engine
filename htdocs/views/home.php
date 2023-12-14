<?php
session_start();

$user = User::ctorViaSessionVar();
// User has to be logged in to use this page. If not, redirect:
if (! isset($user))
    Util::redirect("/views/login.php");
?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.php"; setPageTitle("O nama"); ?>
</head>
<body>
    <header>
        <?php require_once "header.php"; ?>
    </header>

    <main>
        <h2>Moji ispiti</h2>
        
        <p>...</p>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>
