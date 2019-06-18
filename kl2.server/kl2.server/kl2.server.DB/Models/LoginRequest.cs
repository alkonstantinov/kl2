using System;
using System.Collections.Generic;
using System.Text;

namespace kl2.server.DB.Models
{
    public class LoginRequest
    {
        public String Mail { get; set; }

        public String Password { get; set; }
    }
}
