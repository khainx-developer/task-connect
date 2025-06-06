using System;
using Hangfire;

namespace TaskConnect.TaskSchedulerService.Jobs;

public class JobScheduler
{
    public static void ConfigureRecurringJobs()
    {
        // Run sync every hour during work hours (9 AM to 6 PM, Monday to Friday)
        RecurringJob.AddOrUpdate<DataSyncJob>(
            "data-sync-job",
            job => job.SyncDataAsync(),
            "0 9-18 * * 1-5", // Every hour from 9 AM to 6 PM, Monday to Friday
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")); // Vietnam timezone

        // Run a comprehensive sync once daily at 8 AM
        RecurringJob.AddOrUpdate<DataSyncJob>(
            "daily-comprehensive-sync",
            job => job.SyncDataAsync(),
            "0 8 * * 1-5", // 8 AM, Monday to Friday
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
    }
}
