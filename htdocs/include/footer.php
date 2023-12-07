<small>Copyright &copy; 2023 Ivan Dolovčak</small>

<?php
# Put git tag+commit number in bottom right corner

$versionFile = DOCROOT . "/.server/.app_version";

if (!file_exists($versionFile))
    exit;

echo '<a href="https://github.com/ivan-dolovcak/exam-engine/" target="_blank">',
    '<mark id="version">',
    file_get_contents($versionFile), '</mark></a>';
?>
