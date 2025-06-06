using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskConnect.TaskService.Domain.Common.Interfaces;
using TaskConnect.TaskService.Domain.Models;

namespace TaskConnect.TaskService.Application.Queries.WorkLogQueries;

public record GetWorkLogSummaryQuery(
    string OwnerId,
    DateTime? From,
    DateTime? To
) : IRequest<WorkLogSummaryModel>;

public class GetWorkLogSummaryQueryHandler : IRequestHandler<GetWorkLogSummaryQuery, WorkLogSummaryModel>
{
    private readonly IApplicationDbContext _context;

    public GetWorkLogSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorkLogSummaryModel> Handle(GetWorkLogSummaryQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WorkLogs.AsQueryable();

        // Filter by owner (through TaskItem)
        query = query.Where(w => w.TaskItem.OwnerId == request.OwnerId);

        // Filter by date range
        if (request.From.HasValue)
        {
            query = query.Where(w => w.FromTime >= request.From.Value.ToUniversalTime());
        }

        if (request.To.HasValue)
        {
            query = query.Where(w => w.ToTime <= request.To.Value.ToUniversalTime());
        }

        // Calculate total hours
        // Assuming ToTime and FromTime are stored in a way that direct subtraction works or needs conversion
        // This is a simple sum, you might need more complex logic depending on how time is stored
        var totalHours = await query
            .Where(w => w.ToTime.HasValue)
            .SumAsync(w => (w.ToTime!.Value - w.FromTime).TotalHours, cancellationToken);

        return new WorkLogSummaryModel
        {
            TotalHours = totalHours
        };
    }
}