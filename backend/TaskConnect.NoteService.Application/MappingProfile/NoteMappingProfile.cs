using AutoMapper;
using TaskConnect.NoteService.Domain.Entities;
using TaskConnect.NoteService.Domain.Models;

namespace TaskConnect.NoteService.Application.MappingProfile;

public class NoteMappingProfile : Profile
{
    public NoteMappingProfile()
    {
        CreateMap<NoteCreateUpdateModel, Note>();
        CreateMap<Note, NoteResponseModel>();
        
        CreateMap<ChecklistItem, ChecklistItemModel>();
    }
}