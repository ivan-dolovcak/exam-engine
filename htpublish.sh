#!/bin/sh
# This is an FTP script for publishing the website.
# It syncs the local directory with the remote server's root directory.

serverRoot="/public_html"
clientRoot="htdocs"
secretsFile="htdocs/.secrets.json"

hostname=$(jq .ftp.hostname $secretsFile)
username=$(jq .ftp.username $secretsFile)
password=$(jq .ftp.password $secretsFile)

# Write git commit/tag and date to display on website:
version="$(git show \
	--no-patch --format="%(describe) (%ad)" --date="format:%Y-%m-%d %H:%M")"

echo "$version" > "$clientRoot/.version"

lftp -c "
	open $hostname
	user $username $password
	mirror $(cat .htignore) --continue --delete --verbose --reverse \
		$clientRoot $serverRoot
"
