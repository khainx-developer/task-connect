using AutoMapper;
using ezApps.TaskService.Domain.Entities;
using ezApps.TaskService.Domain.Models;

public class NoteMappingProfile : Profile
{
    public NoteMappingProfile()
    {
        CreateMap<NoteCreateModel, Note>();
        CreateMap<Note, NoteResponseModel>();
    }
}