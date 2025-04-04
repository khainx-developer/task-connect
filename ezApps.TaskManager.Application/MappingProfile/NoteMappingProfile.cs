using AutoMapper;
using ezApps.TaskManager.Domain.Entities;
using ezApps.TaskManager.Domain.Models;

public class NoteMappingProfile : Profile
{
    public NoteMappingProfile()
    {
        CreateMap<NoteCreateModel, Note>();
        CreateMap<Note, NoteResponseModel>();
    }
}