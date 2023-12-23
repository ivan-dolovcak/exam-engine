# Exam Engine


## About

Exam Engine is a web application for creating, sharing, submitting and analyzing
user-created exams and forms.

Try the web app [here](http://exam-engine.000webhostapp.com/).


## Project vision

You can see the features implemented so far in the [changelog](./CHANGELOG.md).

> **NOTE:** this is only a rough plan. Ideas may be removed/added/modified in
> the future.

Users have to be registered and logged in to use the application. They may
create an account on this website, or log in using their Google or AAI@Edu.hr
accounts.

Some features of the app will be unavailable for the guest users.

Once logged in, users can submit a pre-existing exam/form (via URL/code). Once
submitted, they can see their results. The exam/form author may receive an
e-mail notification.

Users can also create their own exam/form. First step is to choose the general
exam/form metadata:

- Exam/form title
- Deadline
- Duration
- Number of allowed attempts
- Grading scale
- Are form results public?
- Randomize order of questions?
- Can the user see their results immediately after submitting?
- Display all questions, or display one per page?
- Enable cheating protection?
- Etc.

The second step is to put in all the questions and the answers (if the user is
creating a form, they don't provide the correct answers). The questions may be
e.g.:

- Multiple-choice
- Single-choice
- Fill-in
- Blank space
- True/false
- Connect/dropdown
- Code
- Drawing
- Etc.

Apart from its type, a question has other metadata, e.g.:

- Correct answer(s)
- Points
- Ordinal number
- Is it required?
- Does it require manual review from the exam author?

After creating a new exam/form, the user may share it with a code/URL. They may 
receive an e-mail notification when someone submits an exam/form. They can see 
the exam/form analytics (e.g. grade graphs) and export to e,g. CSV. The whole 
exam/form can be exported into a format suitable for printing.

The UI must be simple and intuitive to use. The website must run smoothly, i.e. 
it shouldn't be resource-heavy.


## License

All source code is licensed under the [MIT license](https://mit-license.org/).
