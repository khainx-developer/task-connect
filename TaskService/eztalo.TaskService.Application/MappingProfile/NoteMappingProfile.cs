using AutoMapper;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Domain.Models;

public class NoteMappingProfile : Profile
{
    public NoteMappingProfile()
    {
        CreateMap<NoteCreateUpdateModel, Note>();
        CreateMap<Note, NoteResponseModel>();
    }
}