using AutoMapper;
using TaskConnect.TaskService.Domain.Entities;
using TaskConnect.TaskService.Domain.Models;

namespace TaskConnect.TaskService.Application.MappingProfile;

public class ProjectMappingProfile : Profile
{
    public ProjectMappingProfile()
    {
        CreateMap<Project, ProjectResponseModel>();
    }
}