<?php session_start(); ?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.php"; setPageTitle("Prijava"); ?>
</head>
<body>
    <header>
        <?php require_once "header.php"; ?>
    </header>

    <main>
        <h2>Prijava</h2>
        
        <form action="/include/login_process.php" method="post">
            <label for="email">E-mail</label>
            <input type="email" name="email">
            <br>
            <label for="password">Lozinka</label>
            <input type="password" name="password">
            <br>
            <input type="submit" value="Prijavi me">
            <?php echo $_SESSION["formMsg"] ?? ""; ?>
        </form>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>

<?php
// Clear old message on page refresh
if ($_SERVER["REQUEST_METHOD"] != "POST")
    unset($_SESSION["formMsg"]);
