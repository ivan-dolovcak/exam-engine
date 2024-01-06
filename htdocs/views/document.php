<?php
session_start();

// User has to be logged in to use this page. If not, redirect:
if (! isset($_SESSION["userID"]))
    Util::redirect("/views/login.phtml");

if (! isset($_GET["ID"]))
    Util::redirect("/views/home.phtml");

$documentID = Util::deobfuscateID($_GET["ID"]);

// Store start time
if (! isset($_SESSION["datetimeStart_$documentID"]))
    $_SESSION["datetimeStart_$documentID"] = date("Y-m-d H:i:s");

$documentFormAction = "/api/submit_document.php?ID={$_GET["ID"]}";
$documentJSON = Document::loadJSON($documentID);
?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.phtml"; setPageTitle("Pregled dokumenta"); ?>

    <script src="/api/generate_document.js"></script>
</head>
<body>
    <header>
        <?php require_once "header.phtml"; ?>
    </header>

    <main id="main">
        <form id="questions-box" method="post" 
            action="<?php echo $documentFormAction; ?>">
            <script defer>generateDocument(<?php echo $documentJSON; ?>)</script>

            <input type="submit" value="Predaj ispit" id="submit">
        </form>
    </main>

    <footer>
        <?php require_once "footer.phtml"; ?>
    </footer>
</body>
</html>
