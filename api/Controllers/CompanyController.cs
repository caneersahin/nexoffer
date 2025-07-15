using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfferManagement.API.DTOs;
using OfferManagement.API.Services;

namespace OfferManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompanyController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompanyController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyCompany()
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

        var company = await _companyService.GetCompanyByUserIdAsync(userId);
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
            Message = "Şirket bilgileri getirildi",
            Data = company
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCompany([FromBody] UpdateCompanyRequest request)
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

        var company = await _companyService.UpdateCompanyAsync(companyId, request);
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
            Message = "Şirket güncellendi",
            Data = company
        });
    }

    [HttpPost("logo")]
    public async Task<IActionResult> UploadLogo([FromForm] IFormFile logo)
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

        if (logo == null || logo.Length == 0)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Dosya yüklenmedi",
                Data = null
            });
        }

        var success = await _companyService.UploadLogoAsync(companyId, logo);
        if (!success)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Logo yüklenemedi",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Logo başarıyla yüklendi",
            Data = null
        });
    }

    [HttpPost("upgrade")]
    public async Task<IActionResult> UpgradePlan([FromBody] UpgradePlanRequest request)
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

        var company = await _companyService.UpgradePlanAsync(companyId, request);
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
            Message = "Plan yükseltildi",
            Data = company
        });
    }

    [HttpPost("payment")]
    public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentRequest request)
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

        var payment = await _companyService.RecordPaymentAsync(companyId, request);
        if (payment == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Şirket bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<PaymentDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Ödeme kaydedildi",
            Data = payment
        });
    }

    [HttpGet("payments")]
    public async Task<IActionResult> GetPaymentHistory()
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

        var payments = await _companyService.GetPaymentHistoryAsync(companyId);
        return Ok(new BaseResponse<List<PaymentDto>>
        {
            Success = true,
            StatusCode = 200,
            Message = "Ödeme geçmişi getirildi",
            Data = payments
        });
    }
}