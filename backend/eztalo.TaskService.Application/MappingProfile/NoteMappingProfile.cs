using AutoMapper;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Domain.Models;

namespace eztalo.TaskService.Application.MappingProfile;

public class NoteMappingProfile : Profile
{
    public NoteMappingProfile()
    {
        CreateMap<NoteCreateUpdateModel, Note>();
        CreateMap<Note, NoteResponseModel>();
        
        CreateMap<ChecklistItem, ChecklistItemModel>();
    }
}