using System;
using System.Collections.Generic;
using System.Text;

namespace kl2.server.DB.Models
{
    public class Document
    {
        public Guid DocumentID { get; set; }
        public DateTime EditDate { get; set; }
        public DateTime? PublishDate { get; set; }
        public String DocumentData { get; set; }        
    }
}
