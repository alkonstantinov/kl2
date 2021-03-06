﻿using System;
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
    public class AdminController : BaseController
    {
        public AdminController(IConfiguration configuration) : base(configuration)
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
        public async Task<IActionResult> UpdateJSON(JSON[] model)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            foreach (var row in model)
                this.dbaf.UpdateJSON(row);
            return Ok();
        }

        [HttpGet("GetJSON")]
        public async Task<IActionResult> GetJSON(String jsonType)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            return Ok(this.dbaf.GetJSON(jsonType));
        }

        [HttpGet("GetDocument")]
        public async Task<IActionResult> GetDocument(Guid documentId)
        {
            if (!this.IsAuthenticationRight("operator"))
                return Unauthorized();
            return Ok(this.dbaf.GetDocument(documentId));
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

        [HttpGet("UnpublishedDocuments")]
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
            if (!this.IsAuthenticationRight("administrator"))
                return Unauthorized();
            return Ok(this.dbaf.SearchUsers(model));
        }

        [HttpPost("SaveUser")]
        public async Task<IActionResult> SaveUser(User model)
        {
            if (!this.IsAuthenticationRight("administrator"))
                return Unauthorized();
            this.dbaf.SaveUser(model);
            return Ok();
        }

        [HttpPost("NewUser")]
        public async Task<IActionResult> NewUser(User model)
        {
            if (!this.IsAuthenticationRight("administrator"))
                return Unauthorized();
            this.dbaf.NewUser(model);
            return Ok();
        }

        [HttpGet("GetImage")]
        public async Task<FileContentResult> GetImage(Guid imageHash)
        {
            var response = File(this.dbaf.GetImage(imageHash), "application/octet-stream"); // FileStreamResult
            return response;
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

        [HttpGet("MailExists")]
        public async Task<IActionResult> MailExists(string mail)
        {
            if (!this.IsAuthenticationRight("administrator"))
                return Unauthorized();

            return Ok(this.dbaf.MailExists(mail));
        }


    }
}