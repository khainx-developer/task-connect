import { useState, useEffect } from "react";
import { baseUserApi } from "../../api";
import { toast } from "react-toastify";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";

interface IntegrationSettingsProps {
  onSettingsCreated: () => void;
  isOpen: boolean;
  onClose: () => void;
  isUpdate?: boolean;
  integrationType?: "jira" | "bitbucket" | null;
  existingSettings?: {
    name: string;
    atlassianEmailAddress: string;
    jiraCloudDomain: string;
    username?: string;
    workspace?: string;
    repositorySlug?: string;
  };
  settingId?: string;
}

const IntegrationSettings = ({ 
  onSettingsCreated, 
  isOpen, 
  onClose, 
  isUpdate = false,
  integrationType: initialIntegrationType,
  existingSettings,
  settingId
}: IntegrationSettingsProps) => {
  const [integrationType, setIntegrationType] = useState<"jira" | "bitbucket" | null>(initialIntegrationType || null);
  const [isSaving, setIsSaving] = useState(false);

  // Jira form state
  const [jiraForm, setJiraForm] = useState({
    name: "",
    apiToken: "",
    atlassianEmailAddress: "",
    jiraCloudDomain: "",
  });

  // Bitbucket form state
  const [bitbucketForm, setBitbucketForm] = useState({
    username: "",
    appPassword: "",
    workspace: "",
    repositorySlug: "",
  });

  // Reset form state and integration type when modal opens/closes or when existingSettings changes
  useEffect(() => {
    if (isOpen) {
      setIntegrationType(initialIntegrationType || null);
      if (existingSettings) {
        if (initialIntegrationType === "jira") {
          setJiraForm({
            name: existingSettings.name || "",
            apiToken: "", // Don't populate API token for security
            atlassianEmailAddress: existingSettings.atlassianEmailAddress || "",
            jiraCloudDomain: existingSettings.jiraCloudDomain || "",
          });
        } else if (initialIntegrationType === "bitbucket") {
          setBitbucketForm({
            username: existingSettings.username || "",
            appPassword: "", // Don't populate app password for security
            workspace: existingSettings.workspace || "",
            repositorySlug: existingSettings.repositorySlug || "",
          });
        }
      }
    }
  }, [isOpen, existingSettings, initialIntegrationType]);

  const handleSaveJiraSettings = async () => {
    if (!isUpdate) {
      if (!jiraForm.name || !jiraForm.apiToken || !jiraForm.atlassianEmailAddress || !jiraForm.jiraCloudDomain) {
        toast.error("All fields are required");
        return;
      }
    } else {
      if (!jiraForm.name || !jiraForm.atlassianEmailAddress || !jiraForm.jiraCloudDomain) {
        toast.error("Name, Atlassian Email, and Jira Cloud Domain are required");
        return;
      }
    }

    setIsSaving(true);
    try {
      // Only include apiToken in the request if it's provided
      const settingsToSave = {
        ...jiraForm,
        apiToken: jiraForm.apiToken || undefined
      };

      if (isUpdate && settingId) {
        await baseUserApi.userSettings.updateJiraSettings(settingId, settingsToSave);
        toast.success("Jira settings updated successfully");
      } else {
        await baseUserApi.userSettings.createJiraSettings(settingsToSave);
        toast.success("Jira settings saved successfully");
      }
      onClose();
      onSettingsCreated();
    } catch (error) {
      console.error("Failed to save Jira settings:", error);
      toast.error("Failed to save Jira settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBitbucketSettings = async () => {
    if (!isUpdate) {
      if (!bitbucketForm.username || !bitbucketForm.appPassword || !bitbucketForm.workspace || !bitbucketForm.repositorySlug) {
        toast.error("All fields are required");
        return;
      }
    } else {
      if (!bitbucketForm.username || !bitbucketForm.workspace || !bitbucketForm.repositorySlug) {
        toast.error("Username, Workspace, and Repository Slug are required");
        return;
      }
    }

    setIsSaving(true);
    try {
      // Only include appPassword in the request if it's provided
      const settingsToSave = {
        ...bitbucketForm,
        appPassword: bitbucketForm.appPassword || undefined
      };

      if (isUpdate && settingId) {
        await baseUserApi.userSettings.updateBitbucketSettings(settingId, settingsToSave);
        toast.success("Bitbucket settings updated successfully");
      } else {
        await baseUserApi.userSettings.createBitbucketSettings(settingsToSave);
        toast.success("Bitbucket settings saved successfully");
      }
      onClose();
      onSettingsCreated();
    } catch (error) {
      console.error("Failed to save Bitbucket settings:", error);
      toast.error("Failed to save Bitbucket settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-6"
    >
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-4">{isUpdate ? 'Update Integration' : 'Add Integration'}</h3>

        {!integrationType ? (
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
        ) : (
          <>
            {integrationType === "jira" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={jiraForm.name}
                    onChange={(e) => setJiraForm({ ...jiraForm, name: e.target.value })}
                    placeholder="Enter integration name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    API Token {isUpdate && "(Leave blank to keep existing)"}
                  </label>
                  <Input
                    type="password"
                    value={jiraForm.apiToken}
                    onChange={(e) => setJiraForm({ ...jiraForm, apiToken: e.target.value })}
                    placeholder={isUpdate ? "Leave blank to keep existing" : "Enter Jira API token"}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Atlassian Email
                  </label>
                  <Input
                    type="email"
                    value={jiraForm.atlassianEmailAddress}
                    onChange={(e) => setJiraForm({ ...jiraForm, atlassianEmailAddress: e.target.value })}
                    placeholder="Enter Atlassian email"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Jira Cloud Domain
                  </label>
                  <Input
                    type="text"
                    value={jiraForm.jiraCloudDomain}
                    onChange={(e) => setJiraForm({ ...jiraForm, jiraCloudDomain: e.target.value })}
                    placeholder="Enter Jira cloud domain"
                    className="w-full"
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
                    value={bitbucketForm.username}
                    onChange={(e) => setBitbucketForm({ ...bitbucketForm, username: e.target.value })}
                    placeholder="Enter Bitbucket username"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    App Password {isUpdate && "(Leave blank to keep existing)"}
                  </label>
                  <Input
                    type="password"
                    value={bitbucketForm.appPassword}
                    onChange={(e) => setBitbucketForm({ ...bitbucketForm, appPassword: e.target.value })}
                    placeholder={isUpdate ? "Leave blank to keep existing" : "Enter Bitbucket app password"}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Workspace
                  </label>
                  <Input
                    type="text"
                    value={bitbucketForm.workspace}
                    onChange={(e) => setBitbucketForm({ ...bitbucketForm, workspace: e.target.value })}
                    placeholder="Enter Bitbucket workspace"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Repository Slug
                  </label>
                  <Input
                    type="text"
                    value={bitbucketForm.repositorySlug}
                    onChange={(e) => setBitbucketForm({ ...bitbucketForm, repositorySlug: e.target.value })}
                    placeholder="Enter repository slug"
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button size="tiny" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          {integrationType && (
            <Button
              size="tiny"
              onClick={integrationType === "jira" ? handleSaveJiraSettings : handleSaveBitbucketSettings}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : isUpdate ? "Update" : "Save"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default IntegrationSettings; 