import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseTaskApi, baseUserApi } from "../../api";
import { ProjectResponseModel } from "../../api/taskApiClient";
import { UserSettingsModel } from "../../api/userApiClient";
import { toast } from "react-toastify";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";

interface JiraFormState {
  name: string;
  apiToken: string;
  atlassianEmailAddress: string;
  jiraCloudDomain: string;
}

interface BitbucketFormState {
  username: string;
  appPassword: string;
  workspace: string;
  repositorySlug: string;
}

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectResponseModel | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettingsModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSettingId, setSelectedSettingId] = useState<string | null>(null);
  const [integrationType, setIntegrationType] = useState<"jira" | "bitbucket" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [isLoadingIntegration, setIsLoadingIntegration] = useState(false);

  // Jira form state
  const [jiraForm, setJiraForm] = useState<JiraFormState>({
    name: "",
    apiToken: "",
    atlassianEmailAddress: "",
    jiraCloudDomain: "",
  });

  // Bitbucket form state
  const [bitbucketForm, setBitbucketForm] = useState<BitbucketFormState>({
    username: "",
    appPassword: "",
    workspace: "",
    repositorySlug: "",
  });

  const [editMode, setEditMode] = useState<{
    isEditing: boolean;
    settingId: string | null;
    type: "jira" | "bitbucket" | null;
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

  const handleAddIntegration = async () => {
    if (!selectedSettingId || !projectId) return;

    try {
      await baseTaskApi.projects.addSettingToProject(projectId, selectedSettingId);
      toast.success("Integration added successfully");
      closeModal();
      fetchProjectDetails(); // Refresh project details
    } catch (error) {
      console.error("Failed to add integration:", error);
      toast.error("Failed to add integration");
    }
  };

  const handleEditIntegration = async (settingId: string, type: "jira" | "bitbucket") => {
    setIsLoadingIntegration(true);
    try {
      const response = await baseUserApi.userSettings.getUserSettingsById(settingId);
      const setting = response.data;

      if (type === "jira") {
        setJiraForm({
          name: setting.settingName ?? "",
          apiToken: "", // Don't show existing token for security
          atlassianEmailAddress: setting.atlassianEmailAddress ?? "",
          jiraCloudDomain: setting.jiraCloudDomain ?? "",
        });
      } else {
        setBitbucketForm({
          username: setting.settingName ?? "",
          appPassword: "", // Don't show existing password for security
          workspace: setting.workspace ?? "",
          repositorySlug: setting.repositorySlug ?? "",
        });
      }

      setEditMode({
        isEditing: true,
        settingId,
        type,
      });
      setIntegrationType(type);
      openModal();
    } catch (error) {
      console.error("Failed to fetch integration details:", error);
      toast.error("Failed to fetch integration details");
      closeModal();
    } finally {
      setIsLoadingIntegration(false);
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

  const handleSaveJiraSettings = async () => {
    if (!jiraForm.name || !jiraForm.apiToken || !jiraForm.atlassianEmailAddress || !jiraForm.jiraCloudDomain) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editMode.isEditing && editMode.settingId) {
        // Update existing Jira settings
        await baseUserApi.userSettings.updateJiraSettings(editMode.settingId, jiraForm);
        toast.success("Jira settings updated successfully");
      } else {
        // Check if project already has a Jira integration
        const hasJiraIntegration = project?.projectSettings?.some(setting => {
          const userSetting = userSettings.find(s => s.settingId === setting.userSettingId);
          return userSetting?.settingTypeId === 100; // 100 is Jira type
        });

        if (hasJiraIntegration) {
          throw new Error("Project already has a Jira integration");
        }

        // Create new Jira settings
        await baseUserApi.userSettings.createJiraSettings(jiraForm);
        toast.success("Jira settings created successfully");
        
        // Fetch the updated user settings to get the newly created setting
        const settingsResponse = await baseUserApi.userSettings.getUserSettings();
        const newSetting = settingsResponse.data.find(s => s.settingName === jiraForm.name);
        
        if (!newSetting?.settingId) {
          throw new Error("Failed to find newly created setting");
        }

        if (!projectId) {
          throw new Error("Project ID is missing");
        }

        // Link the new setting to the project
        await baseTaskApi.projects.addSettingToProject(projectId, newSetting.settingId);
        toast.success("Jira integration linked to project successfully");
      }
      
      // Reset form and close modal
      setJiraForm({
        name: "",
        apiToken: "",
        atlassianEmailAddress: "",
        jiraCloudDomain: "",
      });
      setIntegrationType(null);
      setEditMode({ isEditing: false, settingId: null, type: null });
      closeModal();
      
      // Refresh data
      await Promise.all([
        fetchProjectDetails(),
        fetchUserSettings()
      ]);
    } catch (error) {
      console.error("Failed to save Jira settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save Jira settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBitbucketSettings = async () => {
    if (!bitbucketForm.username || !bitbucketForm.appPassword || !bitbucketForm.workspace || !bitbucketForm.repositorySlug) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editMode.isEditing && editMode.settingId) {
        // Update existing Bitbucket settings
        await baseUserApi.userSettings.updateBitbucketSettings(editMode.settingId, bitbucketForm);
        toast.success("Bitbucket settings updated successfully");
      } else {
        // Check if project already has a Bitbucket integration
        const hasBitbucketIntegration = project?.projectSettings?.some(setting => {
          const userSetting = userSettings.find(s => s.settingId === setting.userSettingId);
          return userSetting?.settingTypeId === 101; // 101 is Bitbucket type
        });

        if (hasBitbucketIntegration) {
          throw new Error("Project already has a Bitbucket integration");
        }

        // Create new Bitbucket settings
        await baseUserApi.userSettings.createBitbucketSettings(bitbucketForm);
        toast.success("Bitbucket settings created successfully");
        
        // Fetch the updated user settings to get the newly created setting
        const settingsResponse = await baseUserApi.userSettings.getUserSettings();
        const newSetting = settingsResponse.data.find(s => s.settingName === bitbucketForm.username);
        
        if (!newSetting?.settingId) {
          throw new Error("Failed to find newly created setting");
        }

        if (!projectId) {
          throw new Error("Project ID is missing");
        }

        // Link the new setting to the project
        await baseTaskApi.projects.addSettingToProject(projectId, newSetting.settingId);
        toast.success("Bitbucket integration linked to project successfully");
      }
      
      // Reset form and close modal
      setBitbucketForm({
        username: "",
        appPassword: "",
        workspace: "",
        repositorySlug: "",
      });
      setIntegrationType(null);
      setEditMode({ isEditing: false, settingId: null, type: null });
      closeModal();
      
      // Refresh data
      await Promise.all([
        fetchProjectDetails(),
        fetchUserSettings()
      ]);
    } catch (error) {
      console.error("Failed to save Bitbucket settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save Bitbucket settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenModal = () => {
    setSelectedSettingId(null);
    setIntegrationType(null);
    setEditMode({ isEditing: false, settingId: null, type: null });
    // Reset forms
    setJiraForm({
      name: "",
      apiToken: "",
      atlassianEmailAddress: "",
      jiraCloudDomain: "",
    });
    setBitbucketForm({
      username: "",
      appPassword: "",
      workspace: "",
      repositorySlug: "",
    });
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

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[600px] p-6"
        >
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-4">
              {editMode.isEditing ? "Edit Integration" : "Add Integration"}
            </h3>

            {isLoadingIntegration ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <>
                {!integrationType && !selectedSettingId ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Select Integration Type
                      </label>
                      <select
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        value={integrationType || ""}
                        onChange={(e) => setIntegrationType(e.target.value as "jira" | "bitbucket")}
                      >
                        <option value="">Select an integration type</option>
                        <option value="jira">Jira</option>
                        <option value="bitbucket">Bitbucket</option>
                      </select>
                    </div>

                    {userSettings.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                          Or select existing integration
                        </label>
                        <select
                          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          value={selectedSettingId || ""}
                          onChange={(e) => setSelectedSettingId(e.target.value || '')}
                        >
                          <option value="">Select an existing integration</option>
                          {userSettings.map((setting) => (
                            <option key={setting.settingId || ''} value={setting.settingId || ''}>
                              {setting.settingName} ({setting.settingTypeName})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                ) : integrationType ? (
                  <>
                    {integrationType === "jira" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Name
                          </label>
                          <Input
                            type="text"
                            value={jiraForm.name || ""}
                            onChange={(e) => setJiraForm({ ...jiraForm, name: e.target.value })}
                            placeholder="Enter integration name"
                            className="w-full"
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            API Token
                          </label>
                          <Input
                            type="password"
                            value={jiraForm.apiToken || ""}
                            onChange={(e) => setJiraForm({ ...jiraForm, apiToken: e.target.value })}
                            placeholder={editMode.isEditing ? "Enter new API token (leave blank to keep existing)" : "Enter Jira API token"}
                            className="w-full"
                            disabled={isSaving}
                          />
                          {editMode.isEditing && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Leave blank to keep the existing API token
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Atlassian Email
                          </label>
                          <Input
                            type="email"
                            value={jiraForm.atlassianEmailAddress || ""}
                            onChange={(e) => setJiraForm({ ...jiraForm, atlassianEmailAddress: e.target.value })}
                            placeholder="Enter Atlassian email"
                            className="w-full"
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Jira Cloud Domain
                          </label>
                          <Input
                            type="text"
                            value={jiraForm.jiraCloudDomain || ""}
                            onChange={(e) => setJiraForm({ ...jiraForm, jiraCloudDomain: e.target.value })}
                            placeholder="Enter Jira cloud domain"
                            className="w-full"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Username
                          </label>
                          <Input
                            type="text"
                            value={bitbucketForm.username || ""}
                            onChange={(e) => setBitbucketForm({ ...bitbucketForm, username: e.target.value })}
                            placeholder="Enter Bitbucket username"
                            className="w-full"
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            App Password
                          </label>
                          <Input
                            type="password"
                            value={bitbucketForm.appPassword || ""}
                            onChange={(e) => setBitbucketForm({ ...bitbucketForm, appPassword: e.target.value })}
                            placeholder={editMode.isEditing ? "Enter new app password (leave blank to keep existing)" : "Enter Bitbucket app password"}
                            className="w-full"
                            disabled={isSaving}
                          />
                          {editMode.isEditing && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Leave blank to keep the existing app password
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Workspace
                          </label>
                          <Input
                            type="text"
                            value={bitbucketForm.workspace || ""}
                            onChange={(e) => setBitbucketForm({ ...bitbucketForm, workspace: e.target.value })}
                            placeholder="Enter Bitbucket workspace"
                            className="w-full"
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Repository Slug
                          </label>
                          <Input
                            type="text"
                            value={bitbucketForm.repositorySlug || ""}
                            onChange={(e) => setBitbucketForm({ ...bitbucketForm, repositorySlug: e.target.value })}
                            placeholder="Enter repository slug"
                            className="w-full"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                size="tiny" 
                variant="outline" 
                onClick={closeModal} 
                disabled={isSaving || isLoadingIntegration}
              >
                Cancel
              </Button>
              {integrationType && !isLoadingIntegration ? (
                <Button
                  size="tiny"
                  onClick={integrationType === "jira" ? handleSaveJiraSettings : handleSaveBitbucketSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editMode.isEditing ? "Updating..." : "Saving..."}
                    </div>
                  ) : (
                    editMode.isEditing ? "Update" : "Save"
                  )}
                </Button>
              ) : selectedSettingId ? (
                <Button
                  size="tiny"
                  onClick={handleAddIntegration}
                  disabled={!selectedSettingId || isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </div>
                  ) : (
                    "Add"
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProjectDetails; 