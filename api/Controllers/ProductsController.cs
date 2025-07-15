using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfferManagement.API.DTOs;
using OfferManagement.API.Services;

namespace OfferManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
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

        var products = await _productService.GetProductsByCompanyAsync(companyId);
        return Ok(new BaseResponse<List<ProductDto>>
        {
            Success = true,
            StatusCode = 200,
            Message = "Ürünler getirildi",
            Data = products
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
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

        var product = await _productService.GetProductByIdAsync(id, companyId);
        if (product == null)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Ürün bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<ProductDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Ürün getirildi",
            Data = product
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
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

        var product = await _productService.CreateProductAsync(request, companyId);

        if (product == null)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Ürün adı boş olamaz veya aynı isimde ürün zaten mevcut.",
                Data = null
            });
        }

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, new BaseResponse<ProductDto>
        {
            Success = true,
            StatusCode = 201,
            Message = "Ürün oluşturuldu",
            Data = product
        });
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
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

        var product = await _productService.UpdateProductAsync(id, request, companyId);
        if (product == null)
        {
            return BadRequest(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 400,
                Message = "Ürün bulunamadı veya geçersiz veri gönderildi.",
                Data = null
            });
        }

        return Ok(new BaseResponse<ProductDto>
        {
            Success = true,
            StatusCode = 200,
            Message = "Ürün güncellendi",
            Data = product
        });
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
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

        var success = await _productService.DeleteProductAsync(id, companyId);
        if (!success)
        {
            return NotFound(new BaseResponse<string>
            {
                Success = false,
                StatusCode = 404,
                Message = "Ürün bulunamadı",
                Data = null
            });
        }

        return Ok(new BaseResponse<string>
        {
            Success = true,
            StatusCode = 200,
            Message = "Ürün silindi",
            Data = null
        });
    }
}
