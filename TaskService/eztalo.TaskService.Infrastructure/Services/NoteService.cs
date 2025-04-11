using eztalo.TaskService.Application.Common;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace eztalo.TaskService.Infrastructure.Services
{
    public class NoteService : INoteService
    {
        private readonly ApplicationDbContext _context;

        public NoteService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Note>> GetAllAsync(string userId)
        {
            return await _context.Notes
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.Pinned)
                .ThenByDescending(n => n.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Note?> GetByIdAsync(Guid id)
        {
            return await _context.Notes.FindAsync(id);
        }

        public async Task<Note> CreateAsync(Note note)
        {
            note.Id = Guid.NewGuid();
            note.CreatedAt = DateTime.UtcNow;
            note.UpdatedAt = DateTime.UtcNow;

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            return note;
        }

        public async Task<Note?> UpdateAsync(Note note)
        {
            var existing = await _context.Notes.FindAsync(note.Id);
            if (existing == null) return null;

            existing.Title = note.Title;
            existing.Content = note.Content;
            existing.Pinned = note.Pinned;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return false;

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
