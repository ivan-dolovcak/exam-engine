<?php
session_start();

// User has to be logged in to use this page. If not, redirect:
if (! isset($_SESSION["userID"]))
    Util::redirect("/views/login.phtml");

if (! isset($_GET["ID"]))
    Util::redirect("/views/home.phtml");

$documentID = Util::deobfuscateID($_GET["ID"]);
// For passing the document metadata to JS:
if (isset($_GET["loadDocumentMetadata"])) {
    $documentJSON = Document::loadMetadataJSON($documentID);
    echo $documentJSON;
    die;
} 

// For passing the document JSON to JS:
if (isset($_GET["loadDocumentContent"])) {
    $documentJSON = Document::loadContentJSON($documentID);
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

    <link rel="stylesheet" href="/static/document.css">
    
    <script src="/api/generate_document.js"></script>
</head>
<body>
    <header>
        <?php require_once "header.phtml"; ?>
    </header>

    <main id="main-wrapper">
        <form id="questions-box" method="post" action="<?php echo $formAction; ?>">
            <script defer>generateDocument();</script>
        </form>

        <div id="questions-box-buttons">
            <input type="button" value="Predaj odgovore">
            <input type="reset" value="Obriši odgovore"
                onclick="document.forms[0].reset(); saveAnswers();">
        </div>
    </main>

    <footer>
        <?php require_once "footer.phtml"; ?>
    </footer>
</body>
</html>
