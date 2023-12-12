<?php
if (! isset($_SESSION))
    session_start();

function getProfileLink(): string
{
    if (isset($_SESSION["user"])) {
        $url = "/views/profile.php";
        $aText = "Profil";
    }
    else {
        $url = "/views/register.php";
        $aText = "Registracija";
    }

    return "<a href='$url'>$aText</a>";
}
?>
<h1>Exam Engine</h1>
<hr>

<nav>
    <a href="/">Početna</a>
    <?php echo getProfileLink(); ?>
</nav>

<hr>
