#!/bin/sh
# This is an FTP script for publishing the website.
# It syncs the local directory with the remote server's root directory.

serverRoot="/public_html"
clientRoot="htdocs"
authFile="$clientRoot/.server/.auth.json"

hostname=$(jq .ftp.hostname $authFile)
username=$(jq .ftp.username $authFile)
password=$(jq .ftp.password $authFile)

# Write git commit/tag and date to display on website:
appVersion="$(git show \
	--no-patch --format="%(describe) (%ad)" --date="format:%Y-%m-%d %H:%M")"

echo "$appVersion" > "$clientRoot/.server/.app_version"

lftp -c "
	open $hostname
	user $username $password
	mirror $(cat .htignore) --continue --delete --verbose --reverse \
		$clientRoot $serverRoot
"
