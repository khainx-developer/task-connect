using AutoMapper;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Domain.Models;

namespace eztalo.TaskService.Application.MappingProfile;

public class MindmapMappingProfile : Profile
{
    public MindmapMappingProfile()
    {
        CreateMap<Mindmap, MindmapResponseModel>();
    }
} 