CREATE EXTENSION IF NOT EXISTS citext;
CREATE SCHEMA IF NOT EXISTS Admin;

drop table if exists Admin.JSON CASCADE;
create table Admin.JSON
(
  JSONID serial not null primary key,
  JSONType character varying,
  JSONData jsonb
);

insert into Admin.JSON (JSONType, JSONData) values('issuers', '[]'),('doctypes', '[]'),('categories', '[]');

create unique index ix_json_jsonType on Admin.JSON(JSONType);


drop table if exists Admin.Document CASCADE;
create table Admin.Document
(
  DocumentID UUID not null primary key,
  EditDate date not null,
  PublishDate date null,
  DocumentData jsonb
);


drop table if exists Admin.UserType CASCADE;
create table Admin.UserType
(
  UserTypeID int not null primary key,
  Name character varying not null
  
);

insert into Admin.UserType (UserTypeID, Name) values(1, 'administrator'), (2, 'operator');

drop table if exists Admin.AdmUser CASCADE;
create table Admin.AdmUser
(
  AdmUserID serial not null primary key,
  Name character varying not null,
  UserTypeID int not null references Admin.UserType(UserTypeID),
  Mail character varying not null,
  Password character varying not null,
  Active boolean not null
  
);
