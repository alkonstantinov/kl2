CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--drop function Admin.Login (_Mail citext, _Password citext); 
create or replace function Admin.Login (_Mail citext, _Password citext) 
returns table (UserId int, Type citext, Name character varying)
 as $$
  select u.AdmUserId, u.UserTypeID, u.Name
  from Admin.AdmUser u 
  where u.Mail = _Mail and u.Password = _Password and u.Active = true;
$$ LANGUAGE sql; 


--select UpdateSession is null from Admin.UpdateSession (md5(random()::text || clock_timestamp()::text)::uuid) ;
create or replace function Admin.UpdateSession (_Token uuid) 
returns citext
 as $$
  declare _userId integer;
  declare _userTypeName citext;
begin
  select into _userId null ;
  select into _userTypeName null ;
  
  update Admin.Session
  set LastAccess = now()
  where token = _Token
  returning AdmUserId into _userId;

  if _userId is not null then
    select into _userTypeName u.UserTypeID 
    from Admin.AdmUser u 
    where u.AdmUserId = _userId;
  end if;  
  return _userTypeName;
end $$ LANGUAGE plpgsql;

--select UpdateSession is null from Admin.UpdateSession (md5(random()::text || clock_timestamp()::text)::uuid) ;
create or replace function Admin.CreateSession (_AdmUserId int) 
returns uuid
 as $$
  declare _token uuid;
begin

  perform 'select Admin.RemoveOldSessions()';

  select into _token md5(random()::text || clock_timestamp()::text)::uuid;

  delete from Admin.Session where AdmUserId = _AdmUserId;

  insert into Admin.Session (AdmUserID, Token, CreatedOn, LastAccess)
   values (_AdmUserId, _token, now(), now());

  return _token;
end $$ LANGUAGE plpgsql;


create or replace function Admin.RemoveOldSessions () 
returns void
 as $$
  delete from Admin.Session
  where DATE_PART('minute', now() - LastAccess)>20;
  
$$ LANGUAGE sql; 


create or replace function Admin.LogOut (_Token uuid) 
returns void
 as $$
  delete from Admin.Session
  where Token = _Token;
  
$$ LANGUAGE sql; 

create or replace function Admin.UpdateJSON (_JSONType citext, _JSONData jsonb) 
returns void
 as $$
  update Admin.JSON
  set JSONData = _JSONData
  where JSONType = _JSONType
$$ LANGUAGE sql; 

create or replace function Admin.GetJSON (_JSONType citext) 
returns table (JSONType citext, JSONData jsonb)
 as $$
  select j.JSONType, j.JSONData 
  from Admin.JSON j
  where _JSONType is null or _JSONType = j.JSONType
$$ LANGUAGE sql; 

create or replace function Admin.GetDocument (_DocumentID uuid) 
returns table (EditDate date, PublishDate date, DocumentData jsonb)
 as $$
  select EditDate, PublishDate, DocumentData
  from Admin.Document d
  where d.DocumentID = _DocumentID
$$ LANGUAGE sql; 

create or replace function Admin.UpdateDOCUMENT (_DocumentID uuid, _DocumentData jsonb) 
returns void
 as $$
  update Admin.Document
  set DocumentData = _DocumentData,
  EditDate = now()
  where DocumentID = _DocumentID
$$ LANGUAGE sql; 

--drop function Admin.UpdateDOCUMENT (_DocumentData jsonb) 
create or replace function Admin.InsertDOCUMENT (_DocumentData jsonb) 
returns void
 as $$
  insert into Admin.Document(DocumentID, EditDate, PublishDate, DocumentData)
  values ((_DocumentData->>'id')::uuid, now(), null, _DocumentData)  
$$ LANGUAGE sql; 


create or replace function Admin.SearchDocument (ss citext, limitResult int) 
returns table (DocumentID uuid, EditDate date, PublishDate date, DocumentData jsonb)
 as $$
  select DocumentID, EditDate, PublishDate, DocumentData
  from Admin.Document d
  where to_tsvector(DocumentData) @@ to_tsquery(ss)
  limit limitResult;
$$ LANGUAGE sql; 

create or replace function Admin.SearchDocument (ss citext) 
returns table (DocumentID uuid, EditDate date, PublishDate date, DocumentData jsonb)
 as $$
  select DocumentID, EditDate, PublishDate, DocumentData
  from Admin.Document d
  where to_tsvector(DocumentData) @@ to_tsquery(ss);
$$ LANGUAGE sql; 

create or replace function Admin.UnpublishedDocuments () 
returns table (DocumentID uuid, EditDate date, PublishDate date, DocumentData jsonb)
 as $$
  select DocumentID, EditDate, PublishDate, DocumentData
  from Admin.Document d
  where d.EditDate>d.PublishDate or d.PublishDate is null
$$ LANGUAGE sql; 


create or replace function Admin.DeleteDOCUMENT (_DocumentID uuid) 
returns void
 as $$
  delete from Admin.Document
  where DocumentID = _DocumentID
$$ LANGUAGE sql; 



--select * from Admin.SearchUsers(0,100,'alex');
create or replace function Admin.SearchUsers (_top int, _rowCount int,_ss citext) 
returns table (Total bigint, AdmUserID int, Name character varying, UserTypeID citext,  Mail citext,  Active boolean)
 as $$

  select 
  (
    select count(1) from Admin.AdmUser 
    where to_tsvector(Name || ' ' || Mail) @@ to_tsquery(_ss)
  ),
  AdmUserID, Name, UserTypeID, Mail, Active 
  from Admin.AdmUser 
  where to_tsvector(Name || ' ' || Mail) @@ to_tsquery(_ss)
  limit _rowCount offset _top;
 
  
$$ LANGUAGE sql; 


create or replace function Admin.SaveUser (_AdmUserID int, _Name character varying, _UserTypeID citext, _Password citext, _Active boolean) 
returns void
 as $$
  update Admin.AdmUser
  set 
    Name = _Name,
    UserTypeID = _UserTypeID,
    Password = coalesce (_Password, Password),
    Active = _Active
  where AdmUserID = _AdmUserID
$$ LANGUAGE sql; 

create or replace function Admin.NewUser (_Name character varying, _UserTypeID citext, _Mail citext, _Password citext, _Active boolean) 
returns void
 as $$
  insert into Admin.AdmUser (Name, UserTypeID, Mail, Password, Active)
  values (_Name, _UserTypeID, _Mail, _Password, _Active)
$$ LANGUAGE sql; 

create or replace function Admin.PublishDOCUMENT (_DocumentID UUID) 
returns void
 as $$
   update Admin.Document
   set PublishDate = now()
   where DocumentID = _DocumentID  
$$ LANGUAGE sql;


--image add


create or replace function Admin.GetImage (_ImageID uuid) 
returns bytea
 as $$
  declare _Image bytea;
  
begin
  select into _Image Image from  admin.Image where ImageID = _ImageID;
  return _Image;
end $$ LANGUAGE plpgsql;


create or replace function Admin.SaveImage (_ImageHash citext, _Image bytea) 
returns uuid
 as $$
  declare _imageID uuid;
  
begin
  select into _imageID null;
  select into _imageID imageid from admin.Image where ImageHash = _ImageHash;

  if _imageID is null then
    select into _imageID md5(random()::text || clock_timestamp()::text)::uuid;
    insert into Admin.Image(ImageID, ImageHash, Image)
    values (_ImageID, _ImageHash, _Image);
  end if;  
  return _imageID;
end $$ LANGUAGE plpgsql;
