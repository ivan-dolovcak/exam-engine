#!/bin/sh
# This is an FTP script for publishing the website.
# It syncs the local directory with the remote server's root directory.

set -e # Exit on error

source ./.ftp_auth.sh # Load FTP auth details
serverRoot="/public_html"
clientRoot="../htdocs"
ignored=$(cat .htignore) # List of files not to be uploaded

source ./update_app_version.sh

lftp -c "
    set net:reconnect-interval-base 3;
	open $hostname
	user $username $password
	mirror $ignored --continue --delete --verbose --reverse \
		$clientRoot $serverRoot
"
