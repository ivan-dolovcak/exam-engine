<?php
session_start();

$user = User::ctorGetCurrentUser();
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
        <h2>Moji dokumenti</h2>
        
        <p>...</p>

        <h3>Napravi novi dokument</h3>

        <form action="/api/create_document.php" method="post">
            <label for="name">Naziv</label>
            <input required type="text" name="name" value="Novi dokument">
            <br>
            <label for="type">Vrsta</label>
            <select required name="type">
                <option value="exam">Ispit</option>
                <option value="form">Obrazac</option>
            </select>
            <br>
            <label for="deadline">Rok za predaju</label>
            <input type="date" name="deadlineDate">
            <input type="time" name="deadlineTime" value="00:00" min="00:00">
            <br>
            <label for="password">Lozinka</label>
            <input type="text" name="password">
            <br>
            <input type="submit" value="Dodaj">

            <?php echo Util::getFormMsg(); ?>
        </form>

        <hr>

        <h2>Moja rješenja</h2>

        <p>...</p>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>
