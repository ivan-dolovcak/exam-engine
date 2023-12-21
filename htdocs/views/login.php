<?php
session_start();

$user = User::ctorGetCurrentUser();
// User has to be logged out to use this page. If not, redirect:
if (isset($user))
    Util::redirect("/");
?>
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
        
        <form action="/api/login_process.php" method="post">
            <label for="emailOrPassword">E-mail ili korisničko ime</label>
            <input type="text" name="emailOrPassword">
            <br>
            <label for="password">Lozinka</label>
            <input type="password" name="password">
            <br>
            <input type="submit" value="Prijavi me">
            <?php echo Util::getFormMsg(); ?>
        </form>

        <p>Nemate račun? <a href="/views/register.php">Registrirajte se</a></p>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>
