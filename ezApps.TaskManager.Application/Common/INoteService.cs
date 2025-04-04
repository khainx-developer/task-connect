using ezApps.TaskManager.Domain.Entities;

namespace ezApps.TaskManager.Application.Common;

public interface INoteService
{
    Task<IEnumerable<Note>> GetAllAsync(string userId);
    Task<Note?> GetByIdAsync(Guid id);
    Task<Note> CreateAsync(Note note);
    Task<Note?> UpdateAsync(Note note);
    Task<bool> DeleteAsync(Guid id);
}