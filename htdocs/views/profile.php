<?php session_start(); ?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.php"; setPageTitle("Profil"); ?>
</head>
<body>
    <header>
        <?php require_once "header.php"; ?>
    </header>

    <main>
        <h2>Profil</h2>
        
<?php
require_once "user_controller.php";
$user = User::makeViaSessionVar();

if (isset($user)) {
    echo "<p>Dobro došli, ", $user->firstName, " ", $user->lastName, "!</p>";
} else {
    echo "<p>Niste prijavljeni.</p>";
}
?>

<?php if (isset($user)): ?>
    <a href="/api/logout.php">Odjavi me</a>
<?php endif; ?>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>
