using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace kl2.server.DB.Models
{
    public class User
    {
        
        public int? AdmUserID { get; set; }
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
                password = kl2.server.common.Utils.GetMD5(value);
            }
        }
        public bool Active { get; set; }

    }
}
