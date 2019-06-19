using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;

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

        protected Guid? GetAuthentication()
        {
            if (Request.Headers.TryGetValue("Authorization", out StringValues authToken))
            {
                string authHeader = authToken.First();
                if (!Guid.TryParse(authHeader, out Guid guidToken))
                    return null;
                else
                    return guidToken;

            }
            else
            {
                return null;
            }
        }

        protected bool IsAuthenticationRight(string userTypeId)
        {
            Guid? token = this.GetAuthentication();
            return token.HasValue && string.Equals(this.dbaf.UpdateSession(token.Value), userTypeId, StringComparison.InvariantCultureIgnoreCase);
        }


    }
}