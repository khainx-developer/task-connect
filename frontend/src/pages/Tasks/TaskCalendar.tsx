import { useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import { baseTaskApi } from "../../api";
import {
  TaskResponseModel,
  WorkLogResponseModel,
  WorkLogCreateUpdateModel,
} from "../../api/taskApiClient";
import WorkLogModal from "./WorkLogModal";
import { debounce, formatLocalDateTime } from "./utils";

interface CalendarEvent extends EventInput {
  id: string; // Worklog ID
  title: string; // Task title
  start?: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    taskId: string;
    workLogId: string;
    taskTitle: string;
  };
}

const TaskCalendar: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskResponseModel | null>(null);
  const [selectedWorkLog, setSelectedWorkLog] = useState<WorkLogResponseModel | null>(null);
  const [modalMode, setModalMode] = useState<"task" | "workLog">("workLog");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [lastFetchedRange, setLastFetchedRange] = useState<{ start: string; end: string } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch work logs based on calendar date range
  const fetchWorkLogs = useCallback(
    async (start: Date, end: Date) => {
      if (
        lastFetchedRange &&
        lastFetchedRange.start === start.toISOString() &&
        lastFetchedRange.end === end.toISOString()
      ) {
        console.log("Skipping fetch: Date range unchanged");
        return;
      }

      try {
        console.log("Fetching work logs for range:", start, end);
        const response = await baseTaskApi.workLogs.getAllWorkLogs({
          from: start.toISOString(),
          to: end.toISOString(),
          isArchived: false,
        });

        const fetchedWorkLogs: WorkLogResponseModel[] = response.data;

        // Map work logs to calendar events
        const calendarEvents: CalendarEvent[] = fetchedWorkLogs.map((workLog) => ({
          id: workLog.id ?? "",
          title: `${workLog.taskItem?.title ?? "Untitled"}: ${new Date(
            workLog.fromTime ?? ""
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}–${new Date(workLog.toTime ?? "").toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          start: workLog.fromTime,
          end: workLog.toTime,
          allDay: false,
          extendedProps: {
            taskId: workLog.taskItemId ?? "",
            workLogId: workLog.id ?? "",
            taskTitle: workLog.taskItem?.title ?? "Untitled",
          },
        }));

        setEvents(calendarEvents);
        setLastFetchedRange({ start: start.toISOString(), end: end.toISOString() });
      } catch (error) {
        console.error("Failed to fetch work logs:", error);
        setEvents([]);
      }
    },
    [lastFetchedRange]
  );

  // Debounced version of fetchWorkLogs
  const debouncedFetchWorkLogs = useCallback(debounce(fetchWorkLogs, 300), [fetchWorkLogs]);

  // Handle calendar view or date changes
  const handleDatesSet = useCallback(
    (dateInfo: { start: Date; end: Date }) => {
      debouncedFetchWorkLogs(dateInfo.start, dateInfo.end);
    },
    [debouncedFetchWorkLogs]
  );

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedTask(null);
    setSelectedWorkLog(null);
    setModalMode("workLog");

    const calendarApi = calendarRef.current?.getApi();
    const currentView = calendarApi?.view.type; // e.g., "dayGridMonth", "timeGridDay"

    // Parse the selected date (which is in UTC) and convert to local time
    const selectedDate = new Date(selectInfo.startStr);
    const offsetMinutes = selectedDate.getTimezoneOffset();
    selectedDate.setMinutes(selectedDate.getMinutes() - offsetMinutes); // Adjust to local time

    let endDate: Date;

    if (currentView === "dayGridMonth") {
      // In dayGridMonth view, set the time to the current local time
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
      // TODO: In the future, fetch userPreferences.defaultWorkLogDuration (in minutes) and use it here
      // e.g., const defaultDuration = userPreferences.defaultWorkLogDuration || 60;
      endDate = new Date(selectedDate.getTime() + 60 * 60 * 1000); // 1 hour later
    } else {
      // In timeGridDay or timeGridWeek views, respect the user's selected range
      endDate = selectInfo.endStr ? new Date(selectInfo.endStr) : new Date(selectedDate.getTime() + 60 * 60 * 1000);
      endDate.setMinutes(endDate.getMinutes() - offsetMinutes); // Adjust to local time
    }

    // Format dates in local time for datetime-local input
    const formattedStartDate = formatLocalDateTime(selectedDate);
    const formattedEndDate = formatLocalDateTime(endDate);
    console.log("Selected Date:", selectedDate.toString());
    console.log("Formatted Start Date:", formattedStartDate);
    console.log("Formatted End Date:", formattedEndDate);

    setEventStartDate(formattedStartDate);
    setEventEndDate(formattedEndDate);

    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const workLogId = clickInfo.event.extendedProps.workLogId;

    // Fetch the work log by ID to get full details
    baseTaskApi.workLogs
      .getWorkLogById(workLogId)
      .then((response) => {
        const workLog = response.data;
        const task = workLog.taskItem;

        if (task && workLog) {
          setSelectedTask(task);
          setSelectedWorkLog(workLog);
          setModalMode("workLog");
          setEventStartDate(formatLocalDateTime(new Date(workLog.fromTime ?? "")));
          setEventEndDate(formatLocalDateTime(new Date(workLog.toTime ?? "")));
          console.log("WorkLog Data:", workLog);
          console.log("Task Data:", task);
          openModal();
        }
      })
      .catch((error) => {
        console.error("Failed to fetch work log:", error);
        alert("Failed to load work log details.");
      });
  };

  const handleAddOrUpdateWorkLog = async (data: WorkLogCreateUpdateModel, task: TaskResponseModel | null) => {
    if (selectedWorkLog) {
      // Note: API doesn't have updateWorkLog, so we'll create a new one
      // You may need to add an updateWorkLog endpoint or handle differently
      await baseTaskApi.workLogs.createWorkLog(data);
    } else {
      await baseTaskApi.workLogs.createWorkLog(data);
    }
    setSelectedTask(task);
  };

  const handleDeleteWorklog = async () => {
    if (selectedWorkLog) {
      // Note: API doesn't have deleteWorkLog endpoint
      // Uncomment and implement when endpoint is available
      /*
      await baseTaskManagerApi.workLogs.deleteWorkLog(selectedWorkLog.id!);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedWorkLog.id)
      );
      */
    }
  };

  const handleFetchWorkLogs = async () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      await fetchWorkLogs(calendarApi.view.activeStart, calendarApi.view.activeEnd);
    }
  };

  const renderEventContent = (eventInfo: {
    timeText: string;
    event: { title: string };
  }) => {
    const colorClass = `fc-bg-primary`;
    return (
      <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Task Calendar | Task Connect"
        description="Manage your project tasks and workLogs in a calendar view."
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay refreshButton",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            datesSet={handleDatesSet}
            customButtons={{
              addEventButton: {
                text: "Add Worklog +",
                click: () => {
                  setSelectedTask(null);
                  setSelectedWorkLog(null);
                  setModalMode("workLog");
                  // Set default start date to current time
                  const now = new Date();
                  const formattedNow = formatLocalDateTime(now);
                  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                  const formattedOneHourLater = formatLocalDateTime(oneHourLater);
                  setEventStartDate(formattedNow);
                  setEventEndDate(formattedOneHourLater);
                  openModal();
                },
              },
              refreshButton: {
                text: "Refresh",
                click: () => {
                  handleFetchWorkLogs();
                },
              },
            }}
          />
        </div>
        <WorkLogModal
          isOpen={isOpen}
          onClose={closeModal}
          modalMode={modalMode}
          selectedTask={selectedTask}
          selectedWorkLog={selectedWorkLog}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
          onAddOrUpdateWorkLog={handleAddOrUpdateWorkLog}
          onDeleteWorklog={handleDeleteWorklog}
          onFetchWorkLogs={handleFetchWorkLogs}
        />
      </div>
    </>
  );
};

export default TaskCalendar;