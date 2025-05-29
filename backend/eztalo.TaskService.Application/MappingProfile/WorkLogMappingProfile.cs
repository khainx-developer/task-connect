using AutoMapper;
using eztalo.TaskService.Domain.Entities;
using eztalo.TaskService.Domain.Models;

namespace eztalo.TaskService.Application.MappingProfile;

public class WorkLogMappingProfile : Profile
{
    public WorkLogMappingProfile()
    {
        CreateMap<WorkLog, WorkLogResponseModel>();
    }
}