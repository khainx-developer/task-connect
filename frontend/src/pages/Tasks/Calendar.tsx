import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import { baseTaskManagerApi } from "../../api";
import {
  ProjectResponseModel,
  TaskResponseModel,
  WorkLogResponseModel,
  WorkLogCreateUpdateModel,
} from "../../api/taskApiClient";

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
  const [selectedTask, setSelectedTask] = useState<TaskResponseModel | null>(
    null
  );
  const [selectedWorkLog, setSelectedWorkLog] =
    useState<WorkLogResponseModel | null>(null);
  const [modalMode, setModalMode] = useState<"task" | "workLog">("workLog");
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventProject, setEventProject] = useState("");
  const [eventNewProject, setEventNewProject] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskResponseModel[]>(
    []
  );
  const [projectSuggestions, setProjectSuggestions] = useState<
    ProjectResponseModel[]
  >([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Fetch work logs based on calendar date range
  const fetchWorkLogs = async (start: Date, end: Date) => {
    try {
      const response = await baseTaskManagerApi.workLogs.getAllWorkLogs({
        from: start.toISOString(),
        to: end.toISOString(),
        isArchived: false,
      });

      const fetchedWorkLogs: WorkLogResponseModel[] = response.data;

      // Map work logs to calendar events
      const calendarEvents: CalendarEvent[] = fetchedWorkLogs.map(
        (workLog) => ({
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
        })
      );

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to fetch work logs:", error);
      setEvents([]);
    }
  };

  // Fetch work logs when the page loads and when the calendar view changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const start = calendarApi.view.activeStart;
      const end = calendarApi.view.activeEnd;
      fetchWorkLogs(start, end);
    }
  }, []);

  // Handle calendar view or date changes
  const handleDatesSet = (dateInfo: { start: Date; end: Date }) => {
    fetchWorkLogs(dateInfo.start, dateInfo.end);
  };

  // Search tasks for autocomplete
  const searchTasks = async (query: string) => {
    if (!query) {
      setTaskSuggestions([]);
      return;
    }
    try {
      const response = await baseTaskManagerApi.tasks.getAllTasks({
        searchText: query,
      });
      setTaskSuggestions(response.data || []);
    } catch (error) {
      console.error("Failed to search tasks:", error);
      setTaskSuggestions([]);
    }
  };

  // Search projects for autocomplete
  const searchProjects = async (query: string) => {
    if (!query) {
      setProjectSuggestions([]);
      return;
    }
    try {
      const response = await baseTaskManagerApi.projects.getAllProjects({
        searchText: query,
      });
      setProjectSuggestions(response.data || []);
    } catch (error) {
      console.error("Failed to search projects:", error);
      setProjectSuggestions([]);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setModalMode("workLog");
    setEventStartDate(selectInfo.startStr.slice(0, 16));
    setEventEndDate(
      selectInfo.endStr
        ? selectInfo.endStr.slice(0, 16)
        : selectInfo.startStr.slice(0, 16)
    );
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const workLogId = clickInfo.event.extendedProps.workLogId;
    // const taskId = clickInfo.event.extendedProps.taskId;

    // Fetch the work log by ID to get full details
    baseTaskManagerApi.workLogs
      .getWorkLogById(workLogId)
      .then((response) => {
        const workLog = response.data;
        const task = workLog.taskItem;

        if (task && workLog) {
          setSelectedTask(task);
          setSelectedWorkLog(workLog);
          setModalMode("workLog");
          setEventTitle(task.title ?? "");
          setEventStartDate(
            new Date(workLog.fromTime ?? "").toISOString().slice(0, 16)
          );
          setEventEndDate(
            new Date(workLog.toTime ?? "").toISOString().slice(0, 16)
          );
          setEventProject(task.projectId || "");
          setEventDescription(workLog.taskItem?.title || "");
          openModal();
        }
      })
      .catch((error) => {
        console.error("Failed to fetch work log:", error);
        alert("Failed to load work log details.");
      });
  };

  const handleAddOrUpdateWorkLog = async () => {
    if (!eventStartDate) {
      alert("Start Date is required.");
      return;
    }

    try {
      let taskId = selectedTask?.id;
      let projectId = eventProject;

      // Create new project if specified
      if (eventNewProject && !eventProject) {
        const projectResponse = await baseTaskManagerApi.projects.createProject(
          {
            title: eventNewProject,
          }
        );
        projectId = projectResponse.data.id ?? "";
      }

      // Create new task if no task selected or new title provided
      if (!taskId || (eventTitle && eventTitle !== selectedTask?.title)) {
        const taskResponse = await baseTaskManagerApi.tasks.createTask({
          title: eventTitle || "Untitled Task",
          projectId: projectId || undefined,
        });
        taskId = taskResponse.data.id;
        setSelectedTask(taskResponse.data);
      }

      // Create or update work log
      const workLogData: WorkLogCreateUpdateModel = {
        taskItemId: taskId,
        fromTime: eventStartDate,
        toTime: eventEndDate || eventStartDate,
        title: eventTitle,
        projectId: projectId || undefined,
      };

      if (selectedWorkLog) {
        await baseTaskManagerApi.workLogs.createWorkLog(workLogData);
      } else {
        await baseTaskManagerApi.workLogs.createWorkLog(workLogData);
      }

      // Refresh events
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        fetchWorkLogs(calendarApi.view.activeStart, calendarApi.view.activeEnd);
      }

      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Failed to save workLog:", error);
      alert("Failed to save workLog.");
    }
  };

  const handleDeleteWorklog = async () => {
    if (selectedWorkLog) {
      // try {
      //   await baseTaskManagerApi.workLogs.deleteWorkLog(selectedWorkLog.id!);
      //   setEvents((prevEvents) =>
      //     prevEvents.filter((event) => event.id !== selectedWorkLog.id)
      //   );
      //   closeModal();
      //   resetModalFields();
      // } catch (error) {
      //   console.error("Failed to delete workLog:", error);
      //   alert("Failed to delete workLog.");
      // }
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventProject("");
    setEventNewProject("");
    setEventDescription("");
    setSelectedTask(null);
    setSelectedWorkLog(null);
    setModalMode("workLog");
    setTaskSuggestions([]);
    setProjectSuggestions([]);
  };

  const renderEventContent = (eventInfo: {
    timeText: string;
    event: { title: string };
  }) => {
    const colorClass = `fc-bg-primary`;
    return (
      <div
        className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
      >
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Task Calendar | Eztalo"
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
              right: "dayGridMonth,timeGridWeek,timeGridDay",
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
                  resetModalFields();
                  setModalMode("workLog");
                  openModal();
                },
              },
            }}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <h5 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white">
              {modalMode === "workLog"
                ? selectedWorkLog
                  ? "Edit Worklog"
                  : "Add Worklog"
                : "Add Worklog"}
            </h5>
            <div className="mt-6">
              <label
                htmlFor="eventTask"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Task <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="eventTask"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => {
                    setEventTitle(e.target.value);
                    setSelectedTask(null);
                    searchTasks(e.target.value);
                  }}
                  className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Search or enter new task title"
                />
                {taskSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded mt-1 max-h-40 overflow-y-auto">
                    {taskSuggestions.map((task) => (
                      <li
                        key={task.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSelectedTask(task);
                          setEventTitle(task.title || "");
                          setEventProject(task.projectId || "");
                          setTaskSuggestions([]);
                        }}
                      >
                        {task.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="eventProject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Project
              </label>
              <div className="relative">
                <input
                  id="eventProject"
                  type="text"
                  value={eventNewProject}
                  onChange={(e) => {
                    setEventNewProject(e.target.value);
                    setEventProject("");
                    searchProjects(e.target.value);
                  }}
                  className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Search or enter new project name"
                />
                {projectSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded mt-1 max-h-40 overflow-y-auto">
                    {projectSuggestions.map((project) => (
                      <li
                        key={project.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setEventProject(project.id || "");
                          setEventNewProject(project.name || "");
                          setProjectSuggestions([]);
                        }}
                      >
                        {project.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="eventStartDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Worklog Start Date & Time{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="eventStartDate"
                type="datetime-local"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                required
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="eventEndDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Worklog End Date & Time
              </label>
              <input
                id="eventEndDate"
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="eventDescription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Worklog Description
              </label>
              <textarea
                id="eventDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full h-20 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="mt-6 flex justify-end gap-4">
              {modalMode === "workLog" && selectedWorkLog && (
                <button
                  onClick={handleDeleteWorklog}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete Worklog
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateWorkLog}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {selectedWorkLog ? "Update Worklog" : "Add Worklog"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default TaskCalendar;
