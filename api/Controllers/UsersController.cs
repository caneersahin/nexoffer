using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfferManagement.API.DTOs;
using OfferManagement.API.Services;

namespace OfferManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var companyIdClaim = User.FindFirst("CompanyId")?.Value;
        if (companyIdClaim == null || !int.TryParse(companyIdClaim, out var companyId))
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Geçersiz şirket",
                Data = null
            });
        }

        var users = await _userService.GetUsersByCompanyAsync(companyId);
        return Ok(new BaseResponse<List<UserDto>>
        {
            Success = true,
            StatusCode = 200,
            Message = "Kullanıcılar getirildi",
            Data = users
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var companyIdClaim = User.FindFirst("CompanyId")?.Value;
        if (companyIdClaim == null || !int.TryParse(companyIdClaim, out var companyId))
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Geçersiz şirket",
                Data = null
            });
        }

        var user = await _userService.CreateUserAsync(request, companyId);
        if (user == null)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Kullanıcı oluşturulamadı",
                Data = null
            });
        }

        return CreatedAtAction(nameof(GetUsers), new BaseResponse<UserDto>
        {
            Success = true,
            StatusCode = 201,
            Message = "Kullanıcı oluşturuldu",
            Data = user
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userService.UpdateUserAsync(id, request);
        if (user == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Kullanıcı bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<UserDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Kullanıcı güncellendi",
            Data = user
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var success = await _userService.DeleteUserAsync(id);
        if (!success)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Kullanıcı bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Kullanıcı silindi",
            Data = null
        });
    }

    [HttpPost("{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(string id)
    {
        var success = await _userService.ToggleUserStatusAsync(id);
        if (!success)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Kullanıcı bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Kullanıcı durumu güncellendi",
            Data = null
        });
    }
}