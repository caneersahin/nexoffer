using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfferManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountVatToOfferItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "OfferItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "VatRate",
                table: "OfferItems",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "OfferItems");

            migrationBuilder.DropColumn(
                name: "VatRate",
                table: "OfferItems");
        }
    }
}
