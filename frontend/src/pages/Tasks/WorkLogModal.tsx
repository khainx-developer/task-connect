import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import { baseTaskApi } from "../../api";
import {
  ProjectResponseModel,
  TaskResponseModel,
  WorkLogResponseModel,
  WorkLogCreateUpdateModel,
} from "../../api/taskApiClient";

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "task" | "workLog";
  selectedTask: TaskResponseModel | null;
  selectedWorkLog: WorkLogResponseModel | null;
  eventStartDate: string;
  eventEndDate: string;
  onAddOrUpdateWorkLog: (data: WorkLogCreateUpdateModel, task: TaskResponseModel | null) => Promise<void>;
  onDeleteWorklog: () => Promise<void>;
  onFetchWorkLogs: () => Promise<void>;
}

const WorkLogModal: React.FC<WorkLogModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  selectedTask: initialSelectedTask,
  selectedWorkLog,
  eventStartDate: initialStartDate,
  eventEndDate: initialEndDate,
  onAddOrUpdateWorkLog,
  onDeleteWorklog,
  onFetchWorkLogs,
}) => {
  const [selectedTask, setSelectedTask] = useState<TaskResponseModel | null>(initialSelectedTask);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState(initialStartDate);
  const [eventEndDate, setEventEndDate] = useState(initialEndDate);
  const [eventProject, setEventProject] = useState("");
  const [eventNewProject, setEventNewProject] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [taskSuggestions, setTaskSuggestions] = useState<TaskResponseModel[]>([]);
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectResponseModel[]>([]);
  const [isNewTask, setIsNewTask] = useState(false);
  const [displayProjectName, setDisplayProjectName] = useState("");

  // Update form state when selectedWorkLog, initialStartDate, or initialEndDate changes
  useEffect(() => {
    if (selectedWorkLog && selectedWorkLog.taskItem) {
      setEventTitle(selectedWorkLog.taskItem.title ?? "");
      setEventProject(selectedWorkLog.taskItem.projectId ?? "");
      setEventDescription(selectedWorkLog.taskItem.description ?? "");
      setSelectedTask(selectedWorkLog.taskItem);
      setIsNewTask(false);
      if (selectedWorkLog.taskItem.project) {
        setDisplayProjectName(selectedWorkLog.taskItem.project.title ?? "");
      } else {
        setDisplayProjectName("");
      }
    } else {
      setEventTitle("");
      setEventProject("");
      setEventDescription("");
      setSelectedTask(initialSelectedTask);
      setIsNewTask(false);
      setDisplayProjectName("");
    }
    setEventStartDate(initialStartDate);
    setEventEndDate(initialEndDate);
  }, [selectedWorkLog, initialStartDate, initialEndDate, initialSelectedTask]);

  // Search tasks for autocomplete
  const searchTasks = async (query: string) => {
    if (!query) {
      setTaskSuggestions([]);
      return;
    }
    try {
      const response = await baseTaskApi.tasks.getAllTasks({
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
      const response = await baseTaskApi.projects.getAllProjects({
        searchText: query,
      });
      setProjectSuggestions(response.data || []);
    } catch (error) {
      console.error("Failed to search projects:", error);
      setProjectSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    if (!eventStartDate) {
      alert("Start Date is required.");
      return;
    }

    // Validate that end date is not before start date
    const start = new Date(eventStartDate);
    const end = eventEndDate ? new Date(eventEndDate) : new Date(start);
    if (end < start) {
      alert("End Date & Time must be after Start Date & Time.");
      return;
    }

    try {
      let taskId = selectedTask?.id;
      let projectId = eventProject;
      let newTask: TaskResponseModel | null = null;

      if (selectedWorkLog?.id) {
        // Update existing work log - only update time fields
        const workLogData: WorkLogCreateUpdateModel = {
          taskItemId: selectedWorkLog.taskItemId,
          fromTime: eventStartDate,
          toTime: eventEndDate || eventStartDate,
          title: selectedWorkLog.taskItem?.title,
          projectId: selectedWorkLog.taskItem?.projectId,
        };
        await baseTaskApi.workLogs.updateWorkLog(selectedWorkLog.id, workLogData);
      } else {
        // Create new work log
        if (isNewTask) {
          // Create new project if specified
          if (eventNewProject && !eventProject) {
            const projectResponse = await baseTaskApi.projects.createProject({
              title: eventNewProject,
            });
            projectId = projectResponse.data.id ?? "";
          }

          // Create new task
          const taskResponse = await baseTaskApi.tasks.createTask({
            title: eventTitle || "Untitled Task",
            projectId: projectId || undefined,
            description: eventDescription,
          });
          taskId = taskResponse.data.id;
          newTask = taskResponse.data;
          setSelectedTask(taskResponse.data);
        }

        const workLogData: WorkLogCreateUpdateModel = {
          taskItemId: taskId,
          fromTime: eventStartDate,
          toTime: eventEndDate || eventStartDate,
          title: eventTitle,
          projectId: projectId || undefined,
        };
        await baseTaskApi.workLogs.createWorkLog(workLogData);
      }

      await onAddOrUpdateWorkLog(
        {
          taskItemId: taskId,
          fromTime: eventStartDate,
          toTime: eventEndDate || eventStartDate,
          title: eventTitle,
          projectId: projectId || undefined,
        },
        newTask || selectedTask
      );
      
      await onFetchWorkLogs();
      onClose();
      resetModalFields();
    } catch (error) {
      console.error("Failed to save workLog:", error);
      alert("Failed to save workLog.");
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteWorklog();
      await onFetchWorkLogs();
      onClose();
      resetModalFields();
    } catch (error) {
      console.error("Failed to delete workLog:", error);
      alert("Failed to delete workLog.");
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
    setTaskSuggestions([]);
    setProjectSuggestions([]);
    setIsNewTask(false);
    setDisplayProjectName("");
  };

  const isEditing = !!selectedWorkLog;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetModalFields();
      }}
      className="max-w-[700px] p-6 lg:p-10"
    >
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
        <h5 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white">
          {isEditing ? "Edit Worklog" : "Add Worklog"}
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
                if (!isEditing) {
                  setSelectedTask(null);
                  setIsNewTask(true);
                  searchTasks(e.target.value);
                }
              }}
              disabled={isEditing}
              className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 disabled:opacity-50"
              placeholder={isEditing ? "Task title" : "Search or enter new task title"}
            />
            {!isEditing && taskSuggestions.length > 0 && (
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
                      setIsNewTask(false);
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
              value={isEditing ? displayProjectName : (isNewTask ? eventNewProject : eventProject)}
              onChange={(e) => {
                if (isNewTask) {
                  setEventNewProject(e.target.value);
                  setEventProject("");
                  searchProjects(e.target.value);
                }
              }}
              disabled={isEditing || (!isNewTask && !!selectedTask)}
              className="w-full h-11 border rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 disabled:opacity-50"
              placeholder={isEditing ? "Project name" : "Search or enter new project name"}
            />
            {!isEditing && isNewTask && projectSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded mt-1 max-h-40 overflow-y-auto">
                {projectSuggestions.map((project) => (
                  <li
                    key={project.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setEventProject(project.id || "");
                      setEventNewProject(project.title || "");
                      setProjectSuggestions([]);
                    }}
                  >
                    {project.title}
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
            Worklog Start Date & Time <span className="text-red-500">*</span>
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
          {isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Worklog
            </button>
          )}
          <button
            onClick={() => {
              onClose();
              resetModalFields();
            }}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? "Update Worklog" : "Add Worklog"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WorkLogModal;