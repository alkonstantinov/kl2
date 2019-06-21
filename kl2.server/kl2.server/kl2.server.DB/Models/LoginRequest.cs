using System;
using System.Collections.Generic;
using System.Text;

namespace kl2.server.DB.Models
{
    public class LoginRequest
    {
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
    }
}
