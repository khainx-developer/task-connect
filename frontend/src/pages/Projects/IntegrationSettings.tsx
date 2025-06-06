import { useState } from "react";
import { baseUserApi } from "../../api";
import { toast } from "react-toastify";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";

interface IntegrationSettingsProps {
  onSettingsCreated: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const IntegrationSettings = ({ onSettingsCreated, isOpen, onClose }: IntegrationSettingsProps) => {
  const [integrationType, setIntegrationType] = useState<"jira" | "bitbucket" | null>(null);
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

  const handleSaveJiraSettings = async () => {
    if (!jiraForm.name || !jiraForm.apiToken || !jiraForm.atlassianEmailAddress || !jiraForm.jiraCloudDomain) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    try {
      await baseUserApi.userSettings.createJiraSettings(jiraForm);
      toast.success("Jira settings saved successfully");
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
    if (!bitbucketForm.username || !bitbucketForm.appPassword || !bitbucketForm.workspace || !bitbucketForm.repositorySlug) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    try {
      await baseUserApi.userSettings.createBitbucketSettings(bitbucketForm);
      toast.success("Bitbucket settings saved successfully");
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
        <h3 className="text-lg font-semibold mb-4">Add Integration</h3>

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
                    API Token
                  </label>
                  <Input
                    type="password"
                    value={jiraForm.apiToken}
                    onChange={(e) => setJiraForm({ ...jiraForm, apiToken: e.target.value })}
                    placeholder="Enter Jira API token"
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
                    App Password
                  </label>
                  <Input
                    type="password"
                    value={bitbucketForm.appPassword}
                    onChange={(e) => setBitbucketForm({ ...bitbucketForm, appPassword: e.target.value })}
                    placeholder="Enter Bitbucket app password"
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
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default IntegrationSettings; 