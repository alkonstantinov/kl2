using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kl2.server.DB.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace kl2.server.Admin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : BaseController
    {
        public UserController(IConfiguration configuration) : base(configuration)
        {

        }


        [HttpPost("Login")]
        public LoginResponse Login(LoginRequest model)
        {
            var result = this.dbaf.Login(model);
            if (result != null)
                result.Token = this.dbaf.CreateSession(result.UserID);
            return result;
        }


    }
}