<?php
session_start();

$user = User::ctorViaSessionVar();
// User has to be logged out to use this page. If not, redirect:
if (isset($user))
    Util::redirect("/");
?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.php"; setPageTitle("Registracija"); ?>
</head>
<body>
    <header>
        <?php require_once "header.php"; ?>
    </header>

    <main>
        <h2>Registracija</h2>
        
        <form method="post" action="/api/register_process.php">
            <label for="email">E-mail</label>
            <input required type="email" name="email">
            <br>
            <label for="password">Lozinka</label>
            <input required type="password" name="password">
            <br>
            <label for="firstName">Ime</label>
            <input required type="text" name="firstName">
            <br>
            <label for="lastName">Prezime</label>
            <input required type="text" name="lastName">
            <br>
            <input type="submit" value="Registriraj me">
            <?php echo Util::getFormMsg(); ?>
        </form>

        <p>Imate račun? <a href="/views/login.php">Prijavite se</a></p>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>
