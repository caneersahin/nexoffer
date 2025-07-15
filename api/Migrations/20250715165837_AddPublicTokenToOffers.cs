using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfferManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicTokenToOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicToken",
                table: "Offers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "TokenExpiresAt",
                table: "Offers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offers_PublicToken",
                table: "Offers",
                column: "PublicToken",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Offers_PublicToken",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "PublicToken",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "TokenExpiresAt",
                table: "Offers");
        }
    }
}
