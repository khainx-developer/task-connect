using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eztalo.TaskService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMindmapEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mindmaps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerId = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Nodes = table.Column<string>(type: "text", nullable: true),
                    Edges = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mindmaps", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mindmaps_UserId",
                table: "Mindmaps",
                column: "OwnerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Mindmaps");
        }
    }
}
