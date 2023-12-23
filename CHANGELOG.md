# Changelog


# v0.3.0 (2023-12-23)

- project folder restructuring & renaming
- massive code improvements
    - Util class for frequently used functions
    - improved htpublish script
    - code simplification, security, checks
    - rigorous commenting
- add project documentation (references & style guide)
    - app requirements / project vision moved to README
- register form
    - more inputs: verify password, username
    - check for duplicates
    - check if username is legal
- login form
    - users can now login either using email or username
- database changes
    - use UTC timestamps
    - fix column typos
- implement SCSS
- implement TS


## v0.2.0 (2023-12-12)

- add views & logic for user login/register
    - loosely following the MVC model
- dynamic header link
    - if user logged in, show "Profile"
    - if not, show "Register" or "Log in" (if cookie exists)
    - login cookie exists for 30 days since the last login


## v0.1.1 (2023-12-09)

- add more basic include files
- improve .htaccess and separating the development and live environments
    - .htaccess sets the global auto_prepend_file, which is a replacement for
      a custom php.ini file, since it's not allowed by my hosting provider
- shorten delay on FTP script


## v0.1.0 (2023-12-06)

This is the intiial version. Everything is ready for web app development (the 
workspace, scripts and configs are set up).

- Add Apache and PHP config
- Add SQL authorization info
- Workspace: differentiate local vs server environment
- Add SQL table definitions
- Show version/tag on website
- Add basic testing HTML & CSS
