import PageMeta from "../../components/common/PageMeta";
import NotesGrid from "./NoteGrid";

export default function Notes({ isArchived }: { isArchived: boolean }) {
  return (
    <>
      <PageMeta title="My Notes" description="" />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <NotesGrid isArchived={isArchived}/>
      </div>
    </>
  );
}
