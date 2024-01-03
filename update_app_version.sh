# Save git commit/tag and date in a file to display on the website

set -e # Exit on error

appVersion="$(git show \
	--no-patch --format="%(describe) (%ad)" --date="format:%Y-%m-%d %H:%M")"

echo "$appVersion" > htdocs/.app_version
