<?php
session_start();

// For passing the document metadata to JS:
if (isset($_GET["loadDocument"])) {
    $documentID = Util::deobfuscateID($_GET["documentID"]);
    $documentJSON = Document::load($documentID);
    echo $documentJSON;
    die;
}
if (isset($_GET["loadSubmission"])) {
    $submissionID = Util::deobfuscateID($_GET["submissionID"]);
    $submissionJSON = Submission::load($submissionID);
    echo $submissionJSON;
    die;
}

// User has to be logged in to use this page. If not, redirect:
if (! isset($_SESSION["userID"]))
    Util::redirect("/views/login.phtml");

// if (! isset($_GET["documentID"]) || ! isset($_GET["mode"]))
//     Util::redirect("/views/home.phtml");

if (! in_array($_GET["mode"], ["answer", "edit", "review"], strict:true))
    Util::redirect("/views/home.phtml");
?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.phtml"; setPageTitle("Pregled dokumenta"); ?>
    
    <?php require_once "{$_SERVER["DOCUMENT_ROOT"]}/partials/question_template.html"; ?>

    <link rel="stylesheet" href="/static/document.css">
    
    <script type="module" src="/api/generate_document.js"></script>
</head>
<body>
    <header>
        <?php require_once "header.phtml"; ?>
    </header>

    <main id="main-wrapper">
        <form id="questions-box"></form>

        <div id="questions-box-buttons">
            <input id="submit-answers" type="button" value="Predaj odgovore">
            <input id="clear-answers" type="reset" value="Obriši odgovore">
        </div>
    </main>

    <footer>
        <?php require_once "footer.phtml"; ?>
    </footer>
</body>
</html>
