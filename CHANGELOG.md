# Changelog


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
