# Changelog


# v0.5.0 (2024-03-04)

- various code improvements
- implemented review & grading front-end and back-end logic
- implemented editing mode
- fixed null errors
- expanded database & implemented checks


# v0.4.0 (2024-01-20)

- add more CSS for form elements, header & nav
- more ajax requests in JS for document data
- basic document redering algorithm done (refactoring needed)
- document answers are saved and loaded locally


# v0.3.1 (2024-01-05)

- added ID obfuscation in GET URL's
- translated the publishing script to Python and moved it in its own repo
- add basic form & logic for inserting a document into db
- create document listing for current user on homepage
- user logic: now only the user ID is stored, not the whole serialized object
- minor file/folder renaming
- minor CSS changes


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

This is the initial version. Everything is ready for web app development (the 
workspace, scripts and configs are set up).

- add Apache and PHP config
- add SQL authorization info
- workspace: differentiate local vs server environment
- add SQL table definitions
- show version/tag on website
- add basic testing HTML & CSS
