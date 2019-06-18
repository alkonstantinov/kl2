using System;
using System.Collections.Generic;
using System.Text;

namespace kl2.server.DB.Models
{
    public class LoginResponse
    {
        public int UserID { get; set; }

        public String Type { get; set; }

        public String Name { get; set; }

        public string Token { get; set; }
    }
}
