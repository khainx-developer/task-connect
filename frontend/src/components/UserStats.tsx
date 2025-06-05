import React, { useEffect, useState } from "react";
import { baseTaskApi, baseNoteApi } from "../api";
import { WorkLogSummaryModel } from "../api/taskApiClient";

const UserStats: React.FC = () => {
  const [totalTasks, setTotalTasks] = useState<number | null>(null);
  const [totalNotes, setTotalNotes] = useState<number | null>(null);
  const [worklogSummary, setWorklogSummary] =
    useState<WorkLogSummaryModel | null>(null);

  useEffect(() => {
    console.log("Fetching user stats...");
    const fetchStats = async () => {
      try {
        // Fetch total tasks
        const tasksResponse = await baseTaskApi.tasks.getTotalTaskCount();
        setTotalTasks(tasksResponse.data);

        // Fetch total notes
        const notesResponse = await baseNoteApi.notes.getTotalNotesCount();
        setTotalNotes(notesResponse.data);

        // Fetch worklog summary (e.g., for today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const worklogResponse = await baseTaskApi.workLogs.getWorkLogSummary({
          from: today.toISOString(),
          to: new Date().toISOString(),
        });
        setWorklogSummary(worklogResponse.data);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
        // Handle errors, e.g., set state to 0 or show an error message
        setTotalTasks(0);
        setTotalNotes(0);
        setWorklogSummary({ totalHours: 0 });
      }
    };

    fetchStats();

    // Optional: Add cleanup function to see if component is unmounting
    return () => {
      console.log("UserStats component cleaning up...");
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Total Notes
        </h3>
        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
          {totalNotes !== null ? totalNotes : "Loading..."}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Total Tasks
        </h3>
        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
          {totalTasks !== null ? totalTasks : "Loading..."}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Worklogs
        </h3>
        <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
          {worklogSummary !== null
            ? `${worklogSummary.totalHours?.toFixed(1)} hours`
            : "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default UserStats;
