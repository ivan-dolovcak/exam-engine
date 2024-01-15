use `EXAM_ENGINE`;

alter table `Submission`
modify column `datetimeEnd` datetime null default utc_timestamp();
