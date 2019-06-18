using System;
using System.Collections.Generic;
using System.Text;

namespace kl2.server.DB.Models
{
    public class SearchUserResponse : User
    {
        public Int64 Total { get; set; }
    }
}
