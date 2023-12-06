<!DOCTYPE html>
<html lang="hr">
<head>
    <meta charset="UTF-8">
    <title>Exam Engine</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script defer src="/static/clean_hosting.js"></script>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <h1>Exam Engine</h1>
    <hr>

    <p>Dobro došli na početnu stranicu usluge Exam Engine!</p>

<?php
$versionFile = "$srvRoot/.server/.app_version";

if (!file_exists($versionFile))
    return;

# Show git tag+commit in bottom-right corner:
echo '<a href="https://github.com/ivan-dolovcak/exam-engine/" target="_blank">'
    . '<span id="version">'
    . file_get_contents($versionFile) . '</span></a>';
?>
</body>
</html>
