use `EXAM_ENGINE`;

alter table `Submission`
add column `gradingJSON` json;

alter table `Document`
add column `numMaxSubmissions` tinyint unsigned default 1
after `passwordHash`;

alter table `Document`
add column `visibility` enum("public", "unlisted", "private") not null default "public"
after `type`;

alter table `Submission`
add column `correctPoints` smallint not null default 0;

alter table `Document`
add column `totalPoints` smallint not null default 0;

alter table Submission
modify column datetimeStart datetime not null default utc_timestamp();

alter table Submission
modify column datetimeEnd datetime null;

alter table Submission
modify column submissionJSON json null;
