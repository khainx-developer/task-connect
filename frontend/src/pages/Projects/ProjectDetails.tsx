import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseTaskApi, baseUserApi } from "../../api";
import { ProjectResponseModel } from "../../api/taskApiClient";
import { UserSettingsDetailModel } from "../../api/userApiClient";
import { toast } from "react-toastify";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Badge from "../../components/ui/badge/Badge";
import IntegrationSettings from "./IntegrationSettings";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectResponseModel | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettingsDetailModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [editMode, setEditMode] = useState<{
    isEditing: boolean;
    settingId: string | null;
    type: "jira" | "bitbucket" | null;
    settings?: UserSettingsDetailModel;
  }>({
    isEditing: false,
    settingId: null,
    type: null,
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchUserSettings();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await baseTaskApi.projects.getProjectById(projectId!);
      setProject(response.data);
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      toast.error("Failed to fetch project details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await baseUserApi.userSettings.getUserSettings();
      setUserSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch user settings:", error);
      toast.error("Failed to fetch user settings");
    }
  };

  const handleEditIntegration = async (settingId: string, type: "jira" | "bitbucket") => {
    try {
      const response = await baseUserApi.userSettings.getUserSettingsById(settingId);
      setEditMode({
        isEditing: true,
        settingId,
        type,
        settings: response.data
      });
      openModal();
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to fetch integration settings");
    }
  };

  const handleDeleteIntegration = async (settingId: string) => {
    if (!window.confirm("Are you sure you want to remove this integration?")) {
      return;
    }

    try {
      await baseTaskApi.projects.removeSettingFromProject(projectId!, settingId);
      toast.success("Integration removed successfully");
      fetchProjectDetails();
    } catch (error) {
      console.error("Failed to remove integration:", error);
      toast.error("Failed to remove integration");
    }
  };

  const handleSettingsCreated = async () => {
    await Promise.all([
      fetchProjectDetails(),
      fetchUserSettings()
    ]);
    setEditMode({ isEditing: false, settingId: null, type: null });
  };

  const handleOpenModal = () => {
    setEditMode({ isEditing: false, settingId: null, type: null });
    openModal();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {project.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
        <div className="mt-2">
          <Badge
            size="sm"
            color={project.isArchived ? "error" : "success"}
          >
            {project.isArchived ? "Archived" : "Active"}
          </Badge>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Integrations
          </h2>
          <Button
            size="tiny"
            onClick={handleOpenModal}
          >
            Add Integration
          </Button>
        </div>

        {project.projectSettings && project.projectSettings.length > 0 ? (
          <div className="grid gap-4">
            {project.projectSettings.map((setting) => {
              const userSetting = userSettings.find(s => s.settingId === setting.userSettingId);
              return (
                <div
                  key={setting.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {userSetting?.settingName || "Unknown Integration"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Type: {userSetting?.settingTypeName || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Added: {new Date(setting.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        size="sm"
                        color={userSetting?.settingTypeId === 100 ? 'info' : 'success'}
                      >
                        {userSetting?.settingTypeName}
                      </Badge>
                      <Button
                        size="tiny"
                        variant="outline"
                        onClick={() => handleEditIntegration(setting.userSettingId || '', userSetting?.settingTypeId === 100 ? "jira" : "bitbucket")}
                      >
                        Edit
                      </Button>
                      <Button
                        size="tiny"
                        variant="outline"
                        className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                        onClick={() => handleDeleteIntegration(setting.userSettingId || '')}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No integrations added yet
          </div>
        )}

        <IntegrationSettings
          isOpen={isOpen}
          onClose={closeModal}
          onSettingsCreated={handleSettingsCreated}
          isUpdate={editMode.isEditing}
          integrationType={editMode.type}
          settingId={editMode.settingId || undefined}
          existingSettings={editMode.isEditing ? {
            name: editMode.settings?.settingName || "",
            atlassianEmailAddress: editMode.settings?.atlassianEmailAddress || "",
            jiraCloudDomain: editMode.settings?.jiraCloudDomain || "",
            username: editMode.settings?.username || "",
            workspace: editMode.settings?.workspace || "",
            repositorySlug: editMode.settings?.repositorySlug || "",
          } : undefined}
        />
      </div>
    </div>
  );
};

export default ProjectDetails; 