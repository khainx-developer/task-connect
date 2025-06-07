using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskConnect.TaskService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkSummary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkSummaries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    SyncDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TicketsJson = table.Column<string>(type: "text", nullable: true),
                    PRsJson = table.Column<string>(type: "text", nullable: true),
                    ActionItemsJson = table.Column<string>(type: "text", nullable: true),
                    NextSteps = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkSummaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkSummaries_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkSummaries_ProjectId",
                table: "WorkSummaries",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkSummaries");
        }
    }
}
