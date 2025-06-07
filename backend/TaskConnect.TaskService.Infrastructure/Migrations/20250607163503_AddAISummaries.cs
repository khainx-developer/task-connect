using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskConnect.TaskService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAISummaries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AISuggestions",
                table: "WorkSummaries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AISummary",
                table: "WorkSummaries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductivityInsights",
                table: "WorkSummaries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProductivityScore",
                table: "WorkSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RiskAnalysis",
                table: "WorkSummaries",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AISuggestions",
                table: "WorkSummaries");

            migrationBuilder.DropColumn(
                name: "AISummary",
                table: "WorkSummaries");

            migrationBuilder.DropColumn(
                name: "ProductivityInsights",
                table: "WorkSummaries");

            migrationBuilder.DropColumn(
                name: "ProductivityScore",
                table: "WorkSummaries");

            migrationBuilder.DropColumn(
                name: "RiskAnalysis",
                table: "WorkSummaries");
        }
    }
}
