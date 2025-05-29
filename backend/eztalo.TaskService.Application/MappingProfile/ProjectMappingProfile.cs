using AutoMapper;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Domain.Models;

namespace eztalo.TaskService.Application.MappingProfile;

public class ProjectMappingProfile : Profile
{
    public ProjectMappingProfile()
    {
        CreateMap<Project, ProjectResponseModel>();
    }
}