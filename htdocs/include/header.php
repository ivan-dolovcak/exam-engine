<?php
function getProfileLink(): string
{
    if (isset($_SESSION["user"])) {
        $url = "/views/profile.php";
        $linkText = "Profil";
    }
    else if (isset($_COOKIE["exam_engine_login"])) {
        $url = "/views/login.php";
        $linkText = "Prijava";
    }
    else {
        $url = "/views/register.php";
        $linkText = "Registracija";
    }

    return "<a href='$url'>$linkText</a>";
}
?>
<h1>Exam Engine</h1>
<hr>

<nav>
    <a href="/">Početna</a>
    <?php echo getProfileLink(); ?>
</nav>

<hr>
