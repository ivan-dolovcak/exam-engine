alter table `User`
modify column `creationDate` date not null default utc_date();

alter table `User`
modify column `lastLoginDatetime` datetime not null default utc_timestamp();

alter table `Document`
modify column `creationDate` date not null default utc_date();
