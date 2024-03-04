use `EXAM_ENGINE`;

create table `User` (
    `ID`                   mediumint unsigned not null auto_increment,
    `username`             varchar(30) not null,
    `email`                varchar(50) not null,
    `passwordHash`         char(60) not null, -- PHP PASSWORD_BCRYPT
    `firstName`            varchar(50) not null,
    `lastName`             varchar(50) not null,
    `creationDate`         date not null default utc_date(),
    `lastLoginDatetime`    datetime not null default utc_timestamp(),
    primary key (`ID`),
    constraint `UK_Username`
        unique key (`username`),
    constraint `UK_UserEmail`
        unique key (`email`)
);

create table `Document` (
    `ID`                  mediumint unsigned not null auto_increment,
    `name`                varchar(50),
    `type`                enum("exam", "form") not null,
    `visibility`          enum("public", "unlisted", "private") 
                          not null default "public",
    `passwordHash`        char(60),
    `numMaxSubmissions`   tinyint unsigned default 1,
    `authorID`            mediumint unsigned,
    `deadlineDatetime`    datetime,
    `creationDate`        date not null default utc_date(),
    `documentJSON`        json,
    `solutionJSON`        json,
    `totalPoints` smallint not null default 0;
    primary key (`ID`),
    constraint `FK_DocumentAuthor`
        foreign key (`authorID`) references `User`(`ID`) 
        on delete set null
);

create table `Submission` (
    `ID`                  mediumint unsigned not null auto_increment,
    `documentID`          mediumint unsigned not null,
    `userID`              mediumint unsigned not null,
    `datetimeStart`       datetime not null default utc_timestamp(),
    `datetimeEnd`         datetime
    `submissionJSON`      json,
    `gradingJSON`         json,
    `correctPoints` smallint not null default 0;
    primary key (`ID`),
    constraint `FK_SubmissionDocument`
        foreign key (`documentID`) references `Document`(`ID`),
    constraint `FK_SubmissionAuthor`
        foreign key (`userID`) references `User`(`ID`)
);
