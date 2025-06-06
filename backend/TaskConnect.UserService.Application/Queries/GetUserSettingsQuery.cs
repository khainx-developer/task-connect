using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.UserService.Domain.Common.Interfaces;
using TaskConnect.UserService.Domain.Models;

namespace TaskConnect.UserService.Application.Queries;

public record GetUserSettingsQuery(string UserId) : IRequest<List<UserSettingsModel>>;

public class GetUserSettingsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetUserSettingsQuery, List<UserSettingsModel>>
{
    public async Task<List<UserSettingsModel>> Handle(GetUserSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await context.UserSettings
            .Where(s => s.UserId == request.UserId)
            .Select(s => new UserSettingsModel
            {
                SettingId = s.Id,
                SettingName = s.Name,
                SettingTypeId = s.Type,
                SettingTypeName = s.Type.ToString(),
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return settings;
    }
}