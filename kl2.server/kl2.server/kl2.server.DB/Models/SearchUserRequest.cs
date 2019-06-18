using System;
using System.Collections.Generic;
using System.Text;

namespace kl2.server.DB.Models
{
    public class SearchUserRequest
    {
        public String SS { get; set; }

        public int Top { get; set; }

        public int RowCount { get; set; }
    }
}
