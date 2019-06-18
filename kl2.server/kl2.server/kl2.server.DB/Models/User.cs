using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace kl2.server.DB.Models
{
    public class User
    {
        protected string GetMd5Hash(string input)
        {
            using (MD5 md5Hash = MD5.Create())
            {
                // Convert the input string to a byte array and compute the hash.
                byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(input));

                // Create a new Stringbuilder to collect the bytes
                // and create a string.
                StringBuilder sBuilder = new StringBuilder();

                // Loop through each byte of the hashed data 
                // and format each one as a hexadecimal string.
                for (int i = 0; i < data.Length; i++)
                {
                    sBuilder.Append(data[i].ToString("x2"));
                }

                // Return the hexadecimal string.
                return sBuilder.ToString();
            }
        }

        public int AdmUserID { get; set; }
        public String Name { get; set; }
        public String UserTypeID { get; set; }
        public String Mail { get; set; }
        private string password;
        public String Password
        {
            get
            {
                return password;
            }
            set
            {
                password = GetMd5Hash(value);
            }
        }
        public bool Active { get; set; }

    }
}
