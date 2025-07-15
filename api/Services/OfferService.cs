using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using OfferManagement.API.Data;
using OfferManagement.API.DTOs;
using OfferManagement.API.Models;
using System.ComponentModel.Design;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace OfferManagement.API.Services;

public class OfferService : IOfferService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public OfferService(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<OfferOperationResponse> CreateOfferAsync(CreateOfferRequest request, string userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user?.CompanyId == null)
        {
            return new OfferOperationResponse { Success = false, Message = "Invalid user" };
        }

        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == user.CompanyId.Value);
        if (company == null)
        {
            return new OfferOperationResponse { Success = false, Message = "Company not found" };
        }

        if (company.SubscriptionEndDate.HasValue && company.SubscriptionEndDate.Value < DateTime.UtcNow)
        {
            company.IsActive = false;
            await _context.SaveChangesAsync();
            return new OfferOperationResponse { Success = false, Message = "Subscription expired. Please renew to continue." };
        }

        if (company.SubscriptionPlan == SubscriptionPlan.Free && company.OffersUsed >= 3)
        {
            return new OfferOperationResponse { Success = false, Message = "Free plan limit reached. Please upgrade your plan." };
        }

        var lastOffer = await _context.Offers
            .Where(o => o.CompanyId == user.CompanyId)
            .OrderByDescending(o => o.Id)
            .FirstOrDefaultAsync();

        var offerNumber = GenerateOfferNumber(lastOffer?.OfferNumber);

        var offer = new Offer
        {
            OfferNumber = offerNumber,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            CustomerAddress = request.CustomerAddress,
            OfferDate = request.OfferDate,
            DueDate = request.DueDate,
            Currency = request.Currency,
            Notes = request.Notes,
            UserId = userId,
            CompanyId = user.CompanyId.Value,
            Items = request.Items.Select(item => new OfferItem
            {
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice
            }).ToList()
        };

        offer.TotalAmount = offer.Items.Sum(i => i.TotalPrice);

        _context.Offers.Add(offer);

        company.OffersUsed += 1;

        await _context.SaveChangesAsync();

        var dto = await GetOfferByIdAsync(offer.Id, user.CompanyId.Value);

        return new OfferOperationResponse
        {
            Success = true,
            Offer = dto,
            Message = "Offer created"
        };
    }

    public async Task<OfferDto?> GetOfferByIdAsync(int id, int companyId)
    {
        var offer = await _context.Offers
            .Include(o => o.Items)
            .Include(o => o.Company)
            .FirstOrDefaultAsync(o => o.Id == id && o.CompanyId == companyId);

        if (offer == null) return null;

        return MapToDto(offer);
    }

    public async Task<List<OfferDto>> GetOffersByUserAsync(string userId, int page = 1, int pageSize = 10)
    {
        await UpdateExpiredOffersAsync();
        var offers = await _context.Offers
            .Include(o => o.Items)
            .Include(o => o.Company)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return offers.Select(MapToDto).ToList();
    }

    public async Task<List<OfferDto>> GetOffersByCompanyAsync(int companyId, int page = 1, int pageSize = 10)
    {
        await UpdateExpiredOffersAsync();
        var offers = await _context.Offers
            .Include(o => o.Items)
            .Include(o => o.Company)
            .Where(o => o.CompanyId == companyId)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return offers.Select(MapToDto).ToList();
    }

    public async Task<OfferDto?> UpdateOfferAsync(int id, UpdateOfferRequest request)
    {
        var offer = await _context.Offers
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null) return null;


        offer.CustomerName = request.CustomerName;
        offer.CustomerEmail = request.CustomerEmail;
        offer.CustomerPhone = request.CustomerPhone;
        offer.CustomerAddress = request.CustomerAddress;
        offer.OfferDate = request.OfferDate;
        offer.DueDate = request.DueDate;
        offer.Currency = request.Currency;
        offer.Notes = request.Notes;

        // Update items
        _context.OfferItems.RemoveRange(offer.Items);
        offer.Items = request.Items.Select(item => new OfferItem
        {
            Description = item.Description,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            TotalPrice = item.Quantity * item.UnitPrice,
            OfferId = offer.Id
        }).ToList();

        offer.TotalAmount = offer.Items.Sum(i => i.TotalPrice);

        await _context.SaveChangesAsync();
        return await GetOfferByIdAsync(offer.Id, offer.CompanyId);
    }

    public async Task<bool> DeleteOfferAsync(int id, string userId)
    {
        var offer = await _context.Offers
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (offer == null) return false;

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SendOfferAsync(int id, string userId)
    {
        var offer = await _context.Offers
            .Include(o => o.Items)
            .Include(o => o.Company)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (offer == null) return false;

        var emailSent = await _emailService.SendOfferEmailAsync(offer);
        if (emailSent)
        {
            offer.Status = OfferStatus.Sent;
            await _context.SaveChangesAsync();
        }

        return emailSent;
    }

    public async Task<bool> AcceptOfferAsync(int id, string userId)
    {
        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (offer == null) return false;
        offer.Status = OfferStatus.Accepted;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectOfferAsync(int id, string userId)
    {
        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (offer == null) return false;
        offer.Status = OfferStatus.Rejected;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelOfferAsync(int id, string userId)
    {
        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (offer == null) return false;
        offer.Status = OfferStatus.Cancelled;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<byte[]?> GetOfferPdfAsync(int id, string userId)
    {
        var offer = await _context.Offers
            .Include(o => o.Items)
            .Include(o => o.Company)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (offer == null) return null;

        if (offer.Status == OfferStatus.Sent)
        {
            offer.Status = OfferStatus.Viewed;
            await _context.SaveChangesAsync();
        }

        return GenerateOfferPdf(offer);
    }

    public async Task<byte[]?> GetOfferPdfPublicAsync(int id)
    {
        var offer = await _context.Offers
            .Include(o => o.Items)
            .Include(o => o.Company)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null) return null;

        if (offer.Status == OfferStatus.Sent)
        {
            offer.Status = OfferStatus.Viewed;
            await _context.SaveChangesAsync();
        }

        return GenerateOfferPdf(offer);
    }

    private string GenerateOfferNumber(string? lastOfferNumber)
    {
        if (string.IsNullOrEmpty(lastOfferNumber))
        {
            return $"TKF-{DateTime.Now:yyyyMM}-001";
        }

        var parts = lastOfferNumber.Split('-');
        if (parts.Length == 3 && int.TryParse(parts[2], out var lastNumber))
        {
            var nextNumber = lastNumber + 1;
            return $"TKF-{DateTime.Now:yyyyMM}-{nextNumber:D3}";
        }

        return $"TKF-{DateTime.Now:yyyyMM}-001";
    }

    private static OfferDto MapToDto(Offer offer)
    {
        return new OfferDto
        {
            Id = offer.Id,
            OfferNumber = offer.OfferNumber,
            CustomerName = offer.CustomerName,
            CustomerEmail = offer.CustomerEmail,
            CustomerPhone = offer.CustomerPhone,
            CustomerAddress = offer.CustomerAddress,
            OfferDate = offer.OfferDate,
            DueDate = offer.DueDate,
            Currency = offer.Currency,
            Notes = offer.Notes,
            TotalAmount = offer.TotalAmount,
            Status = offer.Status,
            CreatedAt = offer.CreatedAt,
            CompanyName = offer.Company.Name,
            Items = offer.Items.Select(item => new OfferItemDto
            {
                Id = item.Id,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice
            }).ToList()
        };
    }

    private byte[] GenerateOfferPdf(Offer offer)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20);
                page.DefaultTextStyle(TextStyle.Default.FontSize(11).FontFamily("Helvetica"));
                page.Background(Colors.White);

                page.Header().Background(Colors.Grey.Lighten3).Padding(10).Row(row =>
                {
                    var logoPath = "wwwroot/" + offer?.Company?.Logo;
                    if (!string.IsNullOrWhiteSpace(offer?.Company?.Logo) && System.IO.File.Exists(logoPath))
                    {
                        row.ConstantColumn(120).Height(80).Image(logoPath, ImageScaling.FitArea);
                    }

                    row.RelativeColumn().AlignRight().Column(col =>
                    {
                        col.Item().Text(offer.Company.Name).FontSize(18).Bold();
                        col.Item().Text(offer.Company.Address);
                        col.Item().Text($"Tel: {offer.Company.Phone}");
                        col.Item().Text($"E-posta: {offer.Company.Email}");
                    });
                });

                page.Content().PaddingVertical(10).Column(column =>
                {
                    column.Spacing(15);

                    column.Item().AlignCenter().Text($"Teklif: {offer.OfferNumber}").Bold().FontSize(20);

                    column.Item().Row(row =>
                    {
                        row.RelativeColumn().Column(col =>
                        {
                            col.Item().Text("TEKLİF BİLGİLERİ").Bold().FontSize(12).Underline();
                            col.Item().Text($"Teklif No: {offer.OfferNumber}");
                            col.Item().Text($"Tarih: {offer.OfferDate:dd.MM.yyyy}");
                        });

                        row.RelativeColumn().Column(col =>
                        {
                            col.Item().Text("MÜŞTERİ BİLGİLERİ").Bold().FontSize(12).Underline();
                            col.Item().Text(offer.CustomerName);
                            col.Item().Text(offer.CustomerAddress);
                        });
                    });

                    column.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Medium);

                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(4);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Ürün Açıklaması");
                            header.Cell().Element(HeaderCell).AlignCenter().Text("Adet");
                            header.Cell().Element(HeaderCell).AlignRight().Text("Birim Fiyat");
                            header.Cell().Element(HeaderCell).AlignRight().Text("Tutar");
                        });

                        foreach (var item in offer.Items)
                        {
                            table.Cell().Element(DataCell).Text(item.Description);
                            table.Cell().Element(DataCell).AlignCenter().Text(item.Quantity.ToString());
                            table.Cell().Element(DataCell).AlignRight().Text(item.UnitPrice.ToString("C"));
                            table.Cell().Element(DataCell).AlignRight().Text(item.TotalPrice.ToString("C"));
                        }

                        table.Footer(footer =>
                        {
                            footer.Cell().ColumnSpan(3).Element(DataCell).AlignRight().Text("Ara Toplam").Bold();
                            footer.Cell().Element(DataCell).AlignRight().Text((offer.TotalAmount * 0.82m).ToString("C")).Bold();

                            footer.Cell().ColumnSpan(3).Element(DataCell).AlignRight().Text("KDV %18").Bold();
                            footer.Cell().Element(DataCell).AlignRight().Text((offer.TotalAmount * 0.18m).ToString("C")).Bold();

                            footer.Cell().ColumnSpan(3).Element(DataCell).AlignRight().Text("Genel Toplam").Bold().FontSize(11);
                            footer.Cell().Element(DataCell).AlignRight().Text(offer.TotalAmount.ToString("C")).Bold().FontSize(11);
                        });

                        static IContainer HeaderCell(IContainer container) =>
                            container.PaddingVertical(5).PaddingLeft(5).Background("#eeeeee").BorderBottom(1).BorderColor(Colors.Grey.Medium).DefaultTextStyle(TextStyle.Default.SemiBold().FontSize(11));

                        static IContainer DataCell(IContainer container) =>
                            container.PaddingVertical(4).PaddingLeft(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2).DefaultTextStyle(TextStyle.Default.FontSize(10));
                    });

                    column.Item().PaddingTop(20).Row(row =>
                    {
                        row.RelativeColumn().Text("Not: Bu teklif belge niteliğindedir. Siparişe dönüşmeden fatura oluşturulmaz.")
                            .Italic().FontSize(9);

                        row.ConstantColumn(200).Column(col =>
                        {
                            col.Item().Text("Yetkili İmza").AlignRight().FontSize(10).Bold();
                            col.Item().Height(40);
                            col.Item().Container().AlignRight().Width(150).LineHorizontal(1);
                        });
                    });
                });

                page.Footer().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Sayfa ").FontSize(9);
                    text.CurrentPageNumber();
                    text.Span(" / ");
                    text.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private async Task UpdateExpiredOffersAsync()
    {
        var expiredOffers = await _context.Offers
            .Where(o => o.DueDate.HasValue && o.DueDate < DateTime.UtcNow &&
                        (o.Status == OfferStatus.Draft || o.Status == OfferStatus.Sent || o.Status == OfferStatus.Viewed))
            .ToListAsync();

        if (expiredOffers.Count == 0) return;

        foreach (var offer in expiredOffers)
        {
            offer.Status = OfferStatus.Expired;
        }

        await _context.SaveChangesAsync();
    }
}