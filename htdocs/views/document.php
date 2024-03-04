<?php
session_start();

// User has to be logged in to use this page. If not, redirect:
if (! isset($_SESSION["userID"]))
    Util::redirect("/views/login.phtml");

// Required mode and either submission or document ID.
if (! (isset($_GET["mode"]) 
        && (isset($_GET["documentID"]) || isset($_GET["submissionID"]))))
    die("invalid GET request");

// Valid generating mode.
if (! in_array($_GET["mode"], ["answer", "edit", "review"], strict:true))
    die("invalid GET request");

if (isset($_GET["documentID"])) {
    $documentID = Util::deobfuscateID($_GET["documentID"]);

    switch($_GET["mode"]) {
    case "answer":
        // Deny document viewing if submitting forbidden.
        if (! Document::isSubmittingAllowed($documentID))
            die("submitting forbidden");
        break;
    case "edit":
        // Deny document editing if not author.
        // if (! Document::isEditingAllowed($documentID))
        //     die("editing forbidden");
        break;
    }
}
?>
<!DOCTYPE html>
<html lang="hr">
<head>
    <?php require_once "head.phtml"; setPageTitle("Pregled dokumenta"); ?>
    
    <?php require_once "{$_SERVER["DOCUMENT_ROOT"]}/partials/question_template.html"; ?>
    <?php require_once "{$_SERVER["DOCUMENT_ROOT"]}/partials/new_question_btn_template.html"; ?>

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
