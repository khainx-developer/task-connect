using AutoMapper;
using TaskConnect.TaskService.Domain.Entities;
using TaskConnect.TaskService.Domain.Models;

namespace TaskConnect.TaskService.Application.MappingProfile;

public class NoteMappingProfile : Profile
{
    public NoteMappingProfile()
    {
        CreateMap<NoteCreateUpdateModel, Note>();
        CreateMap<Note, NoteResponseModel>();
        
        CreateMap<ChecklistItem, ChecklistItemModel>();
    }
}