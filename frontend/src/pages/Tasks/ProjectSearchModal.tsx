import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import { baseTaskApi } from "../../api";
import { ProjectResponseModel } from "../../api/taskApiClient";
import Input from "../../components/form/input/InputField"; // Assuming InputField can be reused

interface ProjectSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectResponseModel | null) => void;
}

const ProjectSearchModal: React.FC<ProjectSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
}) => {
  const [searchText, setSearchText] = useState("");
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false); // New state for creation loading

  useEffect(() => {
    if (!isOpen) {
      // Reset search text and suggestions when modal is closed
      setSearchText("");
      setProjectSuggestions([]);
    } else if (searchText) {
        // Search only if modal is open and there's search text
        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            baseTaskApi.projects.getAllProjects({ searchText })
                .then(response => {
                    setProjectSuggestions(response.data || []);
                })
                .catch(error => {
                    console.error("Failed to search projects:", error);
                    setProjectSuggestions([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    } else {
        // If modal is open but no search text, clear suggestions.
        setProjectSuggestions([]);
    }

  }, [searchText, isOpen]);

  const handleSelect = (project: ProjectResponseModel | null) => {
    onSelectProject(project);
    onClose();
  };

  const handleCreateNewProject = async () => {
      if (!searchText || creatingProject) return; // Prevent multiple clicks or empty name

      setCreatingProject(true);
      try {
          const newProjectResponse = await baseTaskApi.projects.createProject({
              title: searchText,
              // Add description or other fields if needed
              description: ""
          });
          // Pass the newly created project back to the parent modal
          onSelectProject(newProjectResponse.data);
          onClose();
      } catch (error) {
          console.error("Failed to create project:", error);
          alert("Failed to create project."); // Show user feedback
      } finally {
          setCreatingProject(false);
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
      <div className="flex flex-col">
        <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white">Select Project</h5>
        <Input
          type="text"
          placeholder="Search projects or create new"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {loading && <p className="text-gray-500 dark:text-gray-400">Searching...</p>}
        {!loading && projectSuggestions.length === 0 && searchText && !creatingProject && (
            <p className="text-gray-500 dark:text-gray-400 mt-2">No projects found.</p>
        )}
        {creatingProject && <p className="text-gray-500 dark:text-gray-400 mt-2">Creating project...</p>}

        <ul className="mt-4 max-h-60 overflow-y-auto custom-scrollbar">
          {/* Option for No Project - always show when not editing? */}
           {!searchText && (
              <li
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                onClick={() => handleSelect(null)}
              >
                No Project
              </li>
           )}

          {projectSuggestions.map((project) => (
            <li
              key={project.id}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
              onClick={() => handleSelect(project)}
            >
              {project.title}
            </li>
          ))}

          {/* Option to Create New Project */}
          {!projectSuggestions.some(p => p.title?.toLowerCase() === searchText.toLowerCase()) && searchText && !creatingProject && (
              <li
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md font-semibold"
                onClick={handleCreateNewProject}
              >
                + Create new project "{searchText}"
              </li>
          )}
        </ul>
      </div>
    </Modal>
  );
};

export default ProjectSearchModal; 