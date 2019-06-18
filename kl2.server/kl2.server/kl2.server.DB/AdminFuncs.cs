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


    }
}
