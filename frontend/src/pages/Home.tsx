import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <PageMeta
        title="Task Manager | Efficient Task Organization & Tracking"
        description="Task Manager is a powerful tool designed to help users organize, track, and complete tasks efficiently with an intuitive dashboard."
      />
      <PageBreadcrumb pageTitle="Task Manager" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Welcome to Task Manager
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base mb-6">
            Task Manager helps you organize, track, and complete your tasks
            efficiently. Navigate to the dashboard to get started managing your
            tasks effectively.
          </p>

          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
