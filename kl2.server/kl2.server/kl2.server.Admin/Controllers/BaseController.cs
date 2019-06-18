using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace kl2.server.Admin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseController : ControllerBase
    {
        protected IConfiguration configuration;
        protected kl2.server.DB.AdminFuncs dbaf
        {
            get;set;
        }
        

        public BaseController (IConfiguration configuration)
        {
            this.configuration = configuration;
            this.dbaf = new DB.AdminFuncs(configuration);
        }

    }
}