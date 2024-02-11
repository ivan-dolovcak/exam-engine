use `EXAM_ENGINE`;

alter table `Submission`
add column `gradingJSON` json;

alter table `Document`
add column `numMaxSubmissions` tinyint unsigned default 1
after `passwordHash`;

alter table `Document`
add column `visibility` enum("public", "unlisted", "private") not null default "public"
after `type`;
