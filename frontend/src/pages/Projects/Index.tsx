import PageMeta from "../../components/common/PageMeta";
import ProjectTable from "./ProjectTable";

export default function Projects() {
  return (
    <>
      <PageMeta title="Projects" description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <ProjectTable />
      </div>
    </>
  );
} 