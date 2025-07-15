using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfferManagement.API.DTOs;
using OfferManagement.API.Services;

namespace OfferManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers()
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

        var customers = await _customerService.GetCustomersByCompanyAsync(companyId);
        return Ok(new BaseResponse<List<CustomerDto>>
        {
            Success = true,
            StatusCode = 200,
            Message = "Müşteriler getirildi",
            Data = customers
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(int id)
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

        var customer = await _customerService.GetCustomerByIdAsync(id, companyId);
        if (customer == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Müşteri bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<CustomerDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Müşteri getirildi",
            Data = customer
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
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

        var customer = await _customerService.CreateCustomerAsync(request, companyId);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, new BaseResponse<CustomerDto>
        {
            Success = true,
            StatusCode = 201,
            Message = "Müşteri oluşturuldu",
            Data = customer
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerRequest request)
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

        var customer = await _customerService.UpdateCustomerAsync(id, request, companyId);
        if (customer == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Müşteri bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<CustomerDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Müşteri güncellendi",
            Data = customer
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
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

        var success = await _customerService.DeleteCustomerAsync(id, companyId);
        if (!success)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Müşteri bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Müşteri silindi",
            Data = null
        });
    }
}
