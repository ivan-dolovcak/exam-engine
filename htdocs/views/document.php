<?php
session_start();

// User has to be logged in to use this page. If not, redirect:
if (! isset($_SESSION["userID"]))
    Util::redirect("/views/login.phtml");

if (! isset($_GET["ID"]))
    Util::redirect("/views/home.phtml");

$documentID = Util::deobfuscateID($_GET["ID"]);
// For passing the document JSON to JS:
if (isset($_GET["loadDocumentContent"])) {
    $documentJSON = Document::loadJSON($documentID);
    echo $documentJSON;
    die;
}

$formAction = "/api/submit_document.php?ID={$_GET["ID"]}";

?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.phtml"; setPageTitle("Pregled dokumenta"); ?>
    
    <?php require_once "{$_SERVER["DOCUMENT_ROOT"]}/partials/question_template.html"; ?>
    <script src="/api/generate_document.js"></script>
</head>
<body>
    <header>
        <?php require_once "header.phtml"; ?>
    </header>

    <main id="main">
        <form id="questions-box" method="post" action="<?php echo $formAction; ?>">
            <script>generateDocument();</script>

        </form>
        <input type="submit" value="Predaj ispit" id="submit">
    </main>

    <footer>
        <?php require_once "footer.phtml"; ?>
    </footer>
</body>
</html>
