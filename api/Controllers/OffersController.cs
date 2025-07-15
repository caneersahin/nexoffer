using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfferManagement.API.DTOs;
using OfferManagement.API.Services;

namespace OfferManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OffersController : ControllerBase
{
    private readonly IOfferService _offerService;

    public OffersController(IOfferService offerService)
    {
        _offerService = offerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOffers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        //var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var companyIdStr = User.FindFirst("CompanyId")?.Value;

        if (!int.TryParse(companyIdStr, out int companyId))
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Geçersiz şirket ID",
                Data = null
            });
        }

        var offers = await _offerService.GetOffersByCompanyAsync(companyId, page, pageSize);
        return Ok(new BaseResponse<List<OfferDto>>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklifler getirildi",
            Data = offers
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOffer(int id)
    {
        //var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var companyIdStr = User.FindFirst("CompanyId")?.Value;

        if (!int.TryParse(companyIdStr, out int companyId))
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Geçersiz şirket ID",
                Data = null
            });
        }

        var offer = await _offerService.GetOfferByIdAsync(id, companyId);
        if (offer == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Teklif bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<OfferDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklif getirildi",
            Data = offer
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateOffer([FromBody] CreateOfferRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return BadRequest("Invalid user");
        }

        var result = await _offerService.CreateOfferAsync(request, userId);
        if (!result.Success || result.Offer == null)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = result.Message,
                Data = null
            });
        }

        return CreatedAtAction(nameof(GetOffer), new { id = result.Offer.Id }, new BaseResponse<OfferDto>
        {
            Success = true,
            StatusCode = 201,
            Message = "Teklif başarıyla oluşturuldu",
            Data = result.Offer
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOffer(int id, [FromBody] UpdateOfferRequest request)
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

        var offer = await _offerService.UpdateOfferAsync(id, request);
        if (offer == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Teklif bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<OfferDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklif güncellendi",
            Data = offer
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOffer(int id)
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

        var success = await _offerService.DeleteOfferAsync(id, userId);
        if (!success)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Teklif bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklif başarıyla silindi",
            Data = null
        });
    }

    [HttpPost("{id}/send")]
    public async Task<IActionResult> SendOffer(int id)
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

        var success = await _offerService.SendOfferAsync(id, userId);
        if (!success)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Teklif gönderilemedi",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklif başarıyla gönderildi",
            Data = null
        });
    }

    [HttpPost("{id}/accept")]
    public async Task<IActionResult> AcceptOffer(int id)
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

        var success = await _offerService.AcceptOfferAsync(id, userId);
        if (!success)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Durum güncellenemedi",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklif onaylandı",
            Data = null
        });
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectOffer(int id)
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

        var success = await _offerService.RejectOfferAsync(id, userId);
        if (!success)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Durum güncellenemedi",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklif reddedildi",
            Data = null
        });
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOffer(int id)
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

        var success = await _offerService.CancelOfferAsync(id, userId);
        if (!success)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Durum güncellenemedi",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Teklif iptal edildi",
            Data = null
        });
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetOfferPdf(int id)
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

        var pdf = await _offerService.GetOfferPdfAsync(id, userId);
        if (pdf == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Teklif bulunamadı",
                Data = null
            });
        }

        return File(pdf, "application/pdf", $"teklif-{id}.pdf");
    }
}