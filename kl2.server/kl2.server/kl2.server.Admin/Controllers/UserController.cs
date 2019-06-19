using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using kl2.server.DB.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

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
        public async Task<IActionResult> Login(LoginRequest model)
        {
            var result = this.dbaf.Login(model);
            if (result != null)
                result.Token = this.dbaf.CreateSession(result.UserID);
            if (result != null)
                return Ok(result);
            else
                return Unauthorized();
        }

        [HttpGet("Logout")]
        public async Task<IActionResult> Logout()
        {
            var token = this.GetAuthentication();
            if (token.HasValue)
                this.dbaf.Logout(token.Value);
            return Ok();
        }

        [HttpPost("UpdateJSON")]
        public async Task<IActionResult> UpdateJSON(JSON model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            this.dbaf.UpdateJSON(model);
            return Ok();
        }

        [HttpGet("GetJSON")]
        public async Task<IActionResult> GetJSON(String jsonType)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            return Ok(this.GetJSON(jsonType));
        }

        [HttpGet("GetDocument")]
        public async Task<IActionResult> GetDocument(Guid documentId)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            return Ok(this.GetDocument(documentId));
        }

        [HttpPost("UpdateDocument")]
        public async Task<IActionResult> UpdateDocument(Document model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            this.dbaf.UpdateDocument(model);
            return Ok();
        }

        [HttpPost("InsertDOCUMENT")]
        public async Task<IActionResult> InsertDOCUMENT(Document model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            this.dbaf.InsertDOCUMENT(model);
            return Ok();
        }

        [HttpPost("SearchDocument")]
        public async Task<IActionResult> SearchDocument(SearchDocument model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            return Ok(this.dbaf.SearchDocument(model));
        }

        [HttpPost("UnpublishedDocuments")]
        public async Task<IActionResult> UnpublishedDocuments()
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            return Ok(this.dbaf.UnpublishedDocuments());
        }

        [HttpGet("DeleteDOCUMENT")]
        public async Task<IActionResult> DeleteDOCUMENT(Guid documentId)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            this.dbaf.DeleteDOCUMENT(documentId);
            return Ok();
        }

        [HttpGet("PublishDOCUMENT")]
        public async Task<IActionResult> PublishDOCUMENT(Guid documentId)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            this.dbaf.PublishDOCUMENT(documentId);
            return Ok();
        }


        [HttpPost("SearchUsers")]
        public async Task<IActionResult> SearchUsers(SearchUserRequest model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            return Ok(this.dbaf.SearchUsers(model));
        }

        [HttpPost("SaveUser")]
        public async Task<IActionResult> SaveUser(User model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            this.dbaf.SaveUser(model);
            return Ok();
        }

        [HttpPost("NewUser")]
        public async Task<IActionResult> NewUser(User model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            this.dbaf.NewUser(model);
            return Ok();
        }

        [HttpGet("GetImage")]
        public async Task<byte[]> GetImage(Guid imageHash)
        {
            if (!this.IsAuthenticationRight("operator"))
                return null;
            return this.dbaf.GetImage(imageHash);

        }


        [HttpPost("SaveImage")]
        public async Task<IActionResult> SaveImage([FromForm]IFormFile image)
        {
            if (!this.IsAuthenticationRight("operator"))
                return null;

            Stream st = image.OpenReadStream();
            MemoryStream mst = new MemoryStream();
            st.CopyTo(mst);
            string hash;
            byte[] imageBytes = mst.ToArray();
            using (var md5 = MD5.Create())
            {
                hash = string.Join("", md5.ComputeHash(imageBytes).Select(x => x.ToString("X2")));
            }
            return Ok(this.dbaf.SaveImage(hash, imageBytes));

    }


}
}