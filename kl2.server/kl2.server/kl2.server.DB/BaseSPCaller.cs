using FastMember;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace kl2.server.DB
{
    public class BaseSPCaller
    {

        protected IConfiguration configuration;

        protected IDbConnection OpenConnection()
        {
            var connectionString = configuration["DBInfo:ConnectionString"];

            var dbConnection = new NpgsqlConnection(connectionString);
            return dbConnection;
        }


        public BaseSPCaller(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public T ConvertToObject<T>(IDataReader rd) where T : class, new()
        {
            Type type = typeof(T);
            var accessor = TypeAccessor.Create(type);
            var members = accessor.GetMembers();
            var t = new T();

            for (int i = 0; i < rd.FieldCount; i++)
            {
                if (!rd.IsDBNull(i))
                {
                    string fieldName = rd.GetName(i);
                    var classFieldName = members.FirstOrDefault(x => string.Equals(x.Name, fieldName, StringComparison.OrdinalIgnoreCase));

                    if (classFieldName!=null)
                    {
                        accessor[t, classFieldName.Name] = rd.GetValue(i);
                    }
                }
            }

            return t;
        }
    }
}
