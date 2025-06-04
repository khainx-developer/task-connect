import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { baseTaskApi } from "../../api";
import { ProjectResponseModel } from "../../api/taskApiClient";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";

const ProjectTable = () => {
  const [projects, setProjects] = useState<ProjectResponseModel[]>([]);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editProject, setEditProject] = useState<ProjectResponseModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
  });

  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    fetchProjects();
  }, [searchText]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await baseTaskApi.projects.getAllProjects({
        searchText,
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setProjectForm({ title: "", description: "" });
    openModal();
  };

  const handleOpenEditModal = (project: ProjectResponseModel) => {
    setModalMode("edit");
    setEditProject(project);
    setProjectForm({
      title: project.title ?? "",
      description: project.description ?? "",
    });
    openModal();
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === "add") {
        const response = await baseTaskApi.projects.createProject(projectForm);
        setProjects([...projects, response.data]);
        toast.success("Project created successfully");
      } else if (editProject?.id) {
        const response = await baseTaskApi.projects.updateProject(editProject.id, projectForm);
        setProjects(projects.map(p => p.id === editProject.id ? response.data : p));
        toast.success("Project updated successfully");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
      closeModal();
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      const response = await baseTaskApi.projects.archiveProject(projectId);
      setProjects(projects.map(p => p.id === projectId ? response.data : p));
      toast.success("Project archived successfully");
    } catch (error) {
      console.error("Failed to archive project:", error);
      toast.error("Failed to archive project");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search projects..."
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        <Button
          size="tiny"
          startIcon={<PlusIcon />}
          onClick={handleOpenAddModal}
          disabled={isLoading}
        >
          Add Project
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {project.title}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {project.description}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={project.isArchived ? "error" : "success"}
                    >
                      {project.isArchived ? "Archived" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(project.createdAt ?? "").toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex space-x-2">
                      <Button
                        size="tiny"
                        variant="outline"
                        onClick={() => handleOpenEditModal(project)}
                      >
                        Edit
                      </Button>
                      {!project.isArchived && (
                        <Button
                          size="tiny"
                          variant="outline"
                          onClick={() => project.id && handleArchiveProject(project.id)}
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {modalMode === "add" ? "Create New Project" : "Edit Project"}
            </h5>
          </div>
          <div className="mt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Title
              </label>
              <Input
                type="text"
                value={projectForm.title}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, title: e.target.value })
                }
                placeholder="Enter project title"
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                disabled={isSaving}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Description
              </label>
              <TextArea
                value={projectForm.description}
                onChange={(value) =>
                  setProjectForm({ ...projectForm, description: value })
                }
                placeholder="Enter project description"
                rows={4}
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <Button size="tiny" variant="outline" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="tiny" onClick={handleSaveProject} disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {modalMode === "add" ? "Saving..." : "Updating..."}
                </div>
              ) : (
                modalMode === "add" ? "Save" : "Update"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectTable; 