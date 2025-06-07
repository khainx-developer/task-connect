using Hangfire;

namespace TaskConnect.TaskSchedulerService.Jobs;

public class JobScheduler
{
    public static void ConfigureRecurringJobs()
    {
        RecurringJob.AddOrUpdate<DataSyncJob>(
            "data-sync-job",
            job => job.SyncDataAsync(),
            "0 * * * *");
    }
}
