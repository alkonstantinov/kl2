using Microsoft.Extensions.Configuration;
using Dapper;

using System;
using System.Collections.Generic;
using System.Text;
using kl2.server.DB.Models;

namespace kl2.server.DB
{
    public class AdminFuncs : BaseSPCaller
    {

        public AdminFuncs(IConfiguration configuration) : base(configuration)
        {

        }


        public LoginResponse Login(LoginRequest lr)
        {
            var conn = this.OpenConnection();
            LoginResponse result = null;
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.Login(@mail::citext, @password::citext)", new { mail = lr.Mail, password = lr.Password });
                    if (rdr.Read())
                    {
                        result = ConvertToObject<LoginResponse>(rdr);
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public String CreateSession(int userId)
        {
            var conn = this.OpenConnection();
            string token = null;
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.CreateSession(@userId)", new { userId = userId });
                    if (rdr.Read())
                    {
                        token = rdr.GetGuid(0).ToString();
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return token;
        }


        public String UpdateSession(Guid token)
        {
            var conn = this.OpenConnection();
            string level = null;
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.UpdateSession(@token)", new { token = token });
                    if (rdr.Read())
                    {
                        level = rdr.GetString(0);
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return level;
        }

        public void Logout(Guid token)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.LogOut(@token)", new { token = token });

                }

            }
            finally
            {
                conn.Close();
            }
        }

        public void UpdateJSON(JSON model)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.UpdateJSON(@jsonType::citext, @jsonData::jsonb)", new { jsonType = model.JsonType, jsonData = model.JsonData });

                }

            }
            finally
            {
                conn.Close();
            }
        }

        public JSON[] GetJSON(String jsonType)
        {
            var conn = this.OpenConnection();
            List<JSON> result = new List<JSON>();
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.GetJSON(@jsonType::citext)", new { jsonType = jsonType });
                    while (rdr.Read())
                    {
                        result.Add(ConvertToObject<JSON>(rdr));
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result.ToArray();
        }

        public Document GetDocument(Guid documentId)
        {
            var conn = this.OpenConnection();
            Document result = null;
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.GetDocument(@documentId)", new { documentId = documentId });
                    if (rdr.Read())
                    {
                        result = ConvertToObject<Document>(rdr);
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result;
        }


        public void UpdateDocument(Document model)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.UpdateDOCUMENT(documentData)", new { documentData = model.DocumentData });

                }

            }
            finally
            {
                conn.Close();
            }
        }

        public void InsertDOCUMENT(Document model)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.InsertDOCUMENT(documentData)", new { documentData = model.DocumentData });

                }

            }
            finally
            {
                conn.Close();
            }
        }

        public Document[] SearchDocument(SearchDocument model)
        {
            var conn = this.OpenConnection();
            List<Document> result = new List<Document>();
            try
            {
                using (conn)
                {
                    var rdr =
                        model.LimitResult.HasValue ?
                        conn.ExecuteReader("select * from Admin.SearchDocument(@ss::citext, @limitResult)", new { ss = model.SS, limitResult = model.LimitResult.Value })
                        :
                        conn.ExecuteReader("select * from Admin.SearchDocument(@ss::citext)", new { ss = model.SS });
                    while (rdr.Read())
                    {
                        result.Add(ConvertToObject<Document>(rdr));
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result.ToArray();
        }

        public Document[] UnpublishedDocuments()
        {
            var conn = this.OpenConnection();
            List<Document> result = new List<Document>();
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.UnpublishedDocuments()");
                    while (rdr.Read())
                    {
                        result.Add(ConvertToObject<Document>(rdr));
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result.ToArray();
        }

        public void DeleteDOCUMENT(Guid documentId)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.DeleteDOCUMENT(@documentId)", new { documentId = documentId });

                }

            }
            finally
            {
                conn.Close();
            }
        }

        public void PublishDOCUMENT(Guid documentId)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.PublishDOCUMENT(@documentId)", new { documentId = documentId });

                }

            }
            finally
            {
                conn.Close();
            }
        }


        public SearchUserResponse[] SearchUsers(SearchUserRequest model)
        {
            var conn = this.OpenConnection();
            List<SearchUserResponse> result = new List<SearchUserResponse>();
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.SearchUsers(@top, @rowCount, @ss)", new { top = model.Top, rowCount = model.RowCount, ss = model.SS });
                    while (rdr.Read())
                    {
                        result.Add(ConvertToObject<SearchUserResponse>(rdr));
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result.ToArray();
        }

        public void SaveUser(User model)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.SaveUser(@userId, @name, @typeId::citext, @password::citext, @active)", 
                        new { userId = model.AdmUserID, name = model.Name, typeId = model.UserTypeID, password = model.Password, active = model.Active });

                }

            }
            finally
            {
                conn.Close();
            }
        }

        public void NewUser(User model)
        {
            var conn = this.OpenConnection();
            try
            {
                using (conn)
                {
                    conn.ExecuteScalar("select * from Admin.NewUser(@name, @typeId::citext, @password::citext, @active)",
                        new { name = model.Name, typeId = model.UserTypeID, password = model.Password, active = model.Active });

                }

            }
            finally
            {
                conn.Close();
            }
        }

        public byte[] GetImage(Guid imageHash)
        {
            var conn = this.OpenConnection();
            byte[] result = null;
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.GetImage(@imageHash::citext)", new { imageHash = imageHash });
                    if (rdr.Read())
                    {
                        long size = rdr.GetBytes(0, 0, null, 0, 0); //get the length of data 
                        result = new byte[size];
                        int bufferSize = 1024;
                        long bytesRead = 0;
                        int curPos = 0;
                        while (bytesRead < size)
                        {
                            bytesRead += rdr.GetBytes(0, curPos, result, curPos, bufferSize);
                            curPos += bufferSize;
                        }                        
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public Guid SaveImage(string imageHash, byte[] image)
        {
            var conn = this.OpenConnection();
            Guid result = new Guid();
            try
            {
                using (conn)
                {
                    var rdr = conn.ExecuteReader("select * from Admin.SaveImage(@imageHash::citext, @image)", new { imageHash = imageHash, image= image });
                    if (rdr.Read())
                    {
                        result = rdr.GetGuid(0);
                    }
                    rdr.Close();
                }

            }
            finally
            {
                conn.Close();
            }
            return result;
        }

    }
}
