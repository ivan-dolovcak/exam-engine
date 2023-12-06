use `EXAM_ENGINE`;

create table `User` (
    `ID`                   mediumint unsigned not null auto_increment,
    `email`                varchar(50) not null,
    `passwordHash`         char(60) not null, -- PHP PASSWORD_BCRYPT
    `firstName`            varchar(50) not null,
    `lastName`             varchar(50) not null,
    `creationDate`         date not null default current_date(),
    `lastLoginDatetime`    datetime not null default current_timestamp(),
    primary key (`ID`),
    unique (`email`)
);

create table `Document` (
    `ID`                  mediumint unsigned not null auto_increment,
    `name`                varchar(50),
    `type`                enum("exam", "form") not null,
    `passwordHash`        char(60),
    `authorID`            mediumint unsigned,
    `deadlineDatetime`    datetime,
    `creationDate`        date not null default current_date(),
    `documentJson`        json not null,
    `solutionJson`        json,
    primary key (`ID`),
    constraint `FK_DocumentAuthor`
        foreign key (`authorID`) references `User`(`ID`) 
        on delete set null
);

create table `Submittion` (
    `ID`                  mediumint unsigned not null auto_increment,
    `documentID`          mediumint unsigned not null,
    `userID`              mediumint unsigned not null,
    `datetimeStart`       datetime not null,
    `datetimeEnd`         datetime not null,
    `submittionJson`      json not null,
    primary key (`ID`),
    constraint `FK_SubmissionDocument`
        foreign key (`documentID`) references `Document`(`ID`),
    constraint `FK_SubmissionAuthor`
        foreign key (`userID`) references `User`(`ID`)
);
