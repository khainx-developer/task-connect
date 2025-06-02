using Microsoft.EntityFrameworkCore;
using TaskConnect.NoteService.Domain.Entities;

namespace TaskConnect.NoteService.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Note> Notes { get; set; }
    DbSet<ChecklistItem> ChecklistItems { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}