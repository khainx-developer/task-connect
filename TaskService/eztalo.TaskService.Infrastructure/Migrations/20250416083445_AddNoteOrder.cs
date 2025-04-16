using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eztalo.TaskService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNoteOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Notes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "Notes");
        }
    }
}
