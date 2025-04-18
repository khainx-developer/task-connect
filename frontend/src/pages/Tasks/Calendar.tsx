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
} from "../../api/taskApiClient";

interface CalendarEvent extends EventInput {
  id: string; // Worklog ID
  title: string; // Task title
  start: string;
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
  const [modalMode, setModalMode] = useState<"task" | "worklog">("task");
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [eventProject, setEventProject] = useState("");
  const [eventNewProject, setEventNewProject] = useState("");
  const [eventTags, setEventTags] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<TaskResponseModel[]>([]);
  const [projects, setProjects] = useState<ProjectResponseModel[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await baseTaskManagerApi.projects.getAllProjects();
        setProjects(response.data || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks and worklogs based on calendar date range
  const fetchTasks = async (start: Date, end: Date) => {
    try {
      const response = await baseTaskManagerApi.tasks.getAllTasks({
        from: start.toISOString().split("T")[0],
        to: end.toISOString().split("T")[0],
      });

      const fetchedTasks: TaskResponseModel[] = response.data;
      setTasks(fetchedTasks);

      // Map workLogs to calendar events
      const calendarEvents: CalendarEvent[] = fetchedTasks.flatMap((task) =>
        task.workLogs?.map((workLog: WorkLogResponseModel) => ({
          id: workLog.id ?? "",
          title: `${task.title}: ${new Date(workLog.fromTime ?? "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–${new Date(workLog.toTime ?? "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          start: workLog.fromTime,
          end: workLog.toTime,
          allDay: false,
          extendedProps: {
            taskId: task.id,
            workLogId: workLog.id,
            taskTitle: task.title,
          },
        }))
      );

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
      setEvents([]);
    }
  };

  // Fetch tasks when the page loads and when the calendar view changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const start = calendarApi.view.activeStart;
      const end = calendarApi.view.activeEnd;
      fetchTasks(start, end);
    }
  }, []);

  // Handle calendar view or date changes
  const handleDatesSet = (dateInfo: { start: Date; end: Date }) => {
    fetchTasks(dateInfo.start, dateInfo.end);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setModalMode("task");
    setEventStartDate(selectInfo.startStr.slice(0, 16));
    setEventEndDate(
      selectInfo.endStr
        ? selectInfo.endStr.slice(0, 16)
        : selectInfo.startStr.slice(0, 16)
    );
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const worklogId = clickInfo.event.extendedProps.worklogId;
    const taskId = clickInfo.event.extendedProps.taskId;
    const task = tasks.find((t) => t.id === taskId);
    const worklog = task?.worklogs.find((w) => w.id === worklogId);

    if (task && worklog) {
      setSelectedTask(task);
      setSelectedWorkLog(worklog);
      setModalMode("worklog");
      setEventTitle(task.title);
      setEventStartDate(new Date(worklog.start).toISOString().slice(0, 16));
      setEventEndDate(new Date(worklog.end).toISOString().slice(0, 16));
      setEventLevel(task.calendar || "Primary");
      setEventProject(task.project || "");
      setEventTags((task.tags || []).join(", "));
      setEventDescription(worklog.description || "");
      openModal();
    }
  };

  const handleAddOrUpdateTask = async () => {
    if (!eventTitle || !eventStartDate || !eventLevel) {
      alert("Title, Start Date, and Level are required.");
      return;
    }

    const projectName = eventNewProject || eventProject;
    const newWorklog: Worklog = {
      id: Date.now().toString(),
      start: eventStartDate,
      end: eventEndDate || eventStartDate,
      description: eventDescription,
    };

    const newTask: Task = {
      id: selectedTask ? selectedTask.id : Date.now().toString(),
      title: eventTitle,
      project: projectName,
      calendar: eventLevel,
      tags: eventTags
        ? eventTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      worklogs: selectedTask
        ? [...selectedTask.worklogs, newWorklog]
        : [newWorklog],
    };

    try {
      if (selectedTask) {
        await baseTaskManagerApi.put(`/tasks/${selectedTask.id}`, {
          title: newTask.title,
          project: newTask.project,
          calendar: newTask.calendar,
          tags: newTask.tags,
        });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === selectedTask.id ? { ...task, ...newTask } : task
          )
        );
      } else {
        const response = await baseTaskManagerApi.post("/tasks", {
          title: newTask.title,
          project: newTask.project,
          calendar: newTask.calendar,
          tags: newTask.tags,
          worklogs: [newWorklog],
        });
        newTask.id = response.data.id;
        setTasks((prevTasks) => [...prevTasks, newTask]);
      }

      // Add worklog to backend
      await baseTaskManagerApi.post(`/worklogs`, {
        taskId: newTask.id,
        start: newWorklog.start,
        end: newWorklog.end,
        description: newWorklog.description,
      });

      // Refresh events
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        fetchTasks(calendarApi.view.activeStart, calendarApi.view.activeEnd);
      }

      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task.");
    }
  };

  const handleAddOrUpdateWorklog = async () => {
    if (!eventStartDate || !selectedTask) {
      alert("Start Date and Task are required.");
      return;
    }

    const newWorklog: Worklog = {
      id: selectedWorkLog ? selectedWorkLog.id : Date.now().toString(),
      start: eventStartDate,
      end: eventEndDate || eventStartDate,
      description: eventDescription,
    };

    try {
      if (selectedWorkLog) {
        await baseTaskManagerApi.put(`/worklogs/${selectedWorkLog.id}`, {
          taskId: selectedTask.id,
          start: newWorklog.start,
          end: newWorklog.end,
          description: newWorklog.description,
        });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === selectedTask.id
              ? {
                  ...task,
                  worklogs: task.worklogs.map((w) =>
                    w.id === selectedWorkLog.id ? newWorklog : w
                  ),
                }
              : task
          )
        );
      } else {
        await baseTaskManagerApi.post(`/worklogs`, {
          taskId: selectedTask.id,
          start: newWorklog.start,
          end: newWorklog.end,
          description: newWorklog.description,
        });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === selectedTask.id
              ? { ...task, worklogs: [...task.worklogs, newWorklog] }
              : task
          )
        );
      }

      // Refresh events
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        fetchTasks(calendarApi.view.activeStart, calendarApi.view.activeEnd);
      }

      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Failed to save worklog:", error);
      alert("Failed to save worklog.");
    }
  };

  const handleDeleteTask = async () => {
    if (selectedTask) {
      try {
        await baseTaskManagerApi.delete(`/tasks/${selectedTask.id}`);
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== selectedTask.id)
        );
        setEvents((prevEvents) =>
          prevEvents.filter(
            (event) => event.extendedProps.taskId !== selectedTask.id
          )
        );
        closeModal();
        resetModalFields();
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task.");
      }
    }
  };

  const handleDeleteWorklog = async () => {
    if (selectedTask && selectedWorkLog) {
      try {
        await baseTaskManagerApi.delete(`/worklogs/${selectedWorkLog.id}`);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === selectedTask.id
              ? {
                  ...task,
                  worklogs: task.worklogs.filter(
                    (w) => w.id !== selectedWorkLog.id
                  ),
                }
              : task
          )
        );
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== selectedWorkLog.id)
        );
        closeModal();
        resetModalFields();
      } catch (error) {
        console.error("Failed to delete worklog:", error);
        alert("Failed to delete worklog.");
      }
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setEventProject("");
    setEventNewProject("");
    setEventTags("");
    setEventDescription("");
    setSelectedTask(null);
    setSelectedWorkLog(null);
    setModalMode("task");
  };

  const renderEventContent = (eventInfo: any) => {
    const calendarType =
      tasks.find((t) => t.id === eventInfo.event.extendedProps.taskId)
        ?.calendar || "Primary";
    const colorClass = `fc-bg-${calendarType.toLowerCase()}`;
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
        description="Manage your project tasks and worklogs in a calendar view."
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
                text: "Add Task +",
                click: () => {
                  resetModalFields();
                  setModalMode("task");
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
              {modalMode === "task"
                ? selectedTask
                  ? "Edit Task"
                  : "Add Task"
                : selectedWorkLog
                  ? "Edit Worklog"
                  : "Add Worklog"}
            </h5>
            {modalMode === "task" ? (
              <>
                <div className="mt-6">
                  <label
                    htmlFor="eventTitle"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="eventTitle"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    required
                  />
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="eventStartDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Initial Worklog Start Date & Time{" "}
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
                    Initial Worklog End Date & Time
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
                    htmlFor="eventLevel"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="eventLevel"
                    value={eventLevel}
                    onChange={(e) => setEventLevel(e.target.value)}
                    className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    required
                  >
                    <option value="">Select Level</option>
                    {Object.keys(calendarsEvents).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="eventProject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Project
                  </label>
                  <select
                    id="eventProject"
                    value={eventProject}
                    onChange={(e) => {
                      setEventProject(e.target.value);
                      setEventNewProject("");
                    }}
                    className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="eventNewProject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    New Project Name (Optional)
                  </label>
                  <input
                    id="eventNewProject"
                    type="text"
                    value={eventNewProject}
                    onChange={(e) => {
                      setEventNewProject(e.target.value);
                      setEventProject("");
                    }}
                    className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    placeholder="Enter new project name"
                  />
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="eventTags"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Tags (comma separated)
                  </label>
                  <input
                    id="eventTags"
                    type="text"
                    value={eventTags}
                    onChange={(e) => setEventTags(e.target.value)}
                    className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mt-6">
                  <label
                    htmlFor="eventTask"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Task
                  </label>
                  <select
                    id="eventTask"
                    value={selectedTask?.id || ""}
                    onChange={(e) => {
                      const task = tasks.find((t) => t.id === e.target.value);
                      setSelectedTask(task || null);
                      setEventTitle(task?.title || "");
                    }}
                    className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  >
                    <option value="">Select Task</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
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
              </>
            )}
            <div className="mt-6 flex justify-end gap-4">
              {modalMode === "task" && selectedTask && (
                <button
                  onClick={handleDeleteTask}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete Task
                </button>
              )}
              {modalMode === "worklog" && selectedWorkLog && (
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
                onClick={
                  modalMode === "task"
                    ? handleAddOrUpdateTask
                    : handleAddOrUpdateWorklog
                }
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {modalMode === "task"
                  ? selectedTask
                    ? "Update Task"
                    : "Add Task"
                  : selectedWorkLog
                    ? "Update Worklog"
                    : "Add Worklog"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default TaskCalendar;
