<?php
session_start();

$user = User::ctorViaSessionVar();
// User has to be logged in to use this page. If not, redirect:
if (! isset($user))
    Util::redirect("/");
?>
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
    echo "<p>Dobro došli, ", $user->firstName, " ", $user->lastName, "!</p>";
    
    echo "<ul>";
    foreach ($user as $key => $value) {
        if ($value instanceof DateTime)
            $value = $value->format("Y/m/d H:i:s");

        echo "<li>", $key, " => ", $value, "</li>";
    }
        
    echo "</ul>";
?>

    <a href="/api/logout.php">Odjavi me</a>
    </main>

    <footer>
        <?php require_once "footer.php"; ?>
    </footer>
</body>
</html>
