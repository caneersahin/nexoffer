using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfferManagement.API.DTOs;
using OfferManagement.API.Services;

namespace OfferManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize(Roles = "SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var dashboard = await _adminService.GetDashboardAsync();
        return Ok(new BaseResponse<AdminDashboardDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Yönetim paneli getirildi",
            Data = dashboard
        });
    }

    [HttpPost("companies/{id}/upgrade")]
    public async Task<IActionResult> UpgradeCompany(int id, [FromBody] UpgradePlanRequest request)
    {
        var company = await _adminService.UpgradeCompanyAsync(id, request);
        if (company == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Şirket bulunamadı",
                Data = null
            });
        }
        return Ok(new BaseResponse<CompanyDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Şirket yükseltildi",
            Data = company
        });
    }
}
