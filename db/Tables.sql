CREATE EXTENSION IF NOT EXISTS citext;
CREATE SCHEMA IF NOT EXISTS Admin;

drop table if exists Admin.JSON CASCADE;
create table Admin.JSON
(
  JSONID serial not null primary key,
  JSONType citext,
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

CREATE INDEX idx_Document_full_text 
    ON Admin.Document 
    USING gin ( to_tsvector('english',DocumentData) );


drop table if exists Admin.UserType CASCADE;
create table Admin.UserType
(
  UserTypeID citext not null primary key,
  Name character varying not null
  
);

insert into Admin.UserType (UserTypeID, Name) values('administrator', 'Administrator'), ('operator', 'Operator');

drop table if exists Admin.AdmUser CASCADE;
create table Admin.AdmUser
(
  AdmUserID serial not null primary key,
  Name character varying not null,
  UserTypeID citext not null references Admin.UserType(UserTypeID),
  Mail citext not null,
  Password citext not null,
  Active boolean not null  
);

CREATE INDEX idx_AdmUser_full_text 
    ON Admin.AdmUser 
    USING gin ( to_tsvector('english',Name || ' ' || Mail) );


drop table if exists Admin.Session CASCADE;
create table Admin.Session
(
  SessionID serial not null primary key,    
  AdmUserID int not null references Admin.AdmUser(AdmUserID),
  Token uuid not null,
  CreatedOn timestamp not null,
  LastAccess timestamp not null  
);



drop table if exists Admin.Image CASCADE;
create table Admin.Image
(
  ImageID uuid not null primary key,    
  ImageHash citext not null,
  Image bytea not null
);
