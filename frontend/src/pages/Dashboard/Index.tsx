import PageMeta from "../../components/common/PageMeta";
import UserStats from "../../components/UserStats";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="User Dashboard | Task Connect"
        description="Dashboard showing user task, note, and worklog statistics."
      />
      {/* <PageBreadcrumb pageTitle="Basic Tables" /> */}
      <div className="space-y-6">
        {/* <ComponentCard title="Basic Table 1"> */}
        {/* <BasicTableOne /> */}
        {/* </ComponentCard> */}
        <UserStats />
      </div>
    </>
  );
}
