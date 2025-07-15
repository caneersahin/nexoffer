using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfferManagement.API.DTOs;
using OfferManagement.API.Services;

namespace OfferManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (!response.Success)
        {
            return BadRequest(new BaseResponse<AuthResponse>
            {
                Success = false,
                StatusCode = 400,
                Message = response.Message,
                Data = null
            });
        }

        return Ok(new BaseResponse<AuthResponse>
        {
            Success = true,
            StatusCode = 200,
            Message = "Giriş başarılı",
            Data = response
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        if (!response.Success)
        {
            return BadRequest(new BaseResponse<AuthResponse>
            {
                Success = false,
                StatusCode = 400,
                Message = response.Message,
                Data = null
            });
        }

        return Ok(new BaseResponse<AuthResponse>
        {
            Success = true,
            StatusCode = 200,
            Message = "Kayıt başarılı",
            Data = response
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var response = await _authService.RefreshTokenAsync(request);
        if (!response.Success)
        {
            return BadRequest(new BaseResponse<AuthResponse>
            {
                Success = false,
                StatusCode = 400,
                Message = response.Message,
                Data = null
            });
        }

        return Ok(new BaseResponse<AuthResponse>
        {
            Success = true,
            StatusCode = 200,
            Message = "Token yenilendi",
            Data = response
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Geçersiz kullanıcı",
                Data = null
            });
        }

        await _authService.LogoutAsync(userId);
        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Çıkış yapıldı",
            Data = null
        });
    }
}