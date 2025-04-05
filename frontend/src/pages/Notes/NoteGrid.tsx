import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { baseTaskManagerApi } from "../../api";
import NoteCard from "./NoteCard";
import { Note } from "./note";
import { toast } from "react-toastify";
import { NoteResponseModel } from "../../api/taskManagerApiClient";

const NotesGrid = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await baseTaskManagerApi.note.noteList();

      const notesData: Note[] = response.data.map(
        (note: NoteResponseModel) => ({
          id: note.id,
          title: note.title ?? "",
          content: note.content ?? "",
        })
      );
      setNotes(notesData);
    };

    fetchNotes();
  }, []);

  const { isOpen, openModal, closeModal } = useModal();

  const [newNote, setNewNote] = useState<Note>({
    id: "",
    title: "",
    content: "",
  });

  const handleAddNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;

    const saveNote = await baseTaskManagerApi.note.noteCreate({
      title: newNote.title,
      content: newNote.content,
    });
    // if (saveNote.status !== 200) return;

    setNotes([...notes, newNote]);
    setNewNote({
      id: saveNote.data.id ?? "",
      title: "",
      content: "",
    });
    closeModal();

    toast.success("Successfully created note");
  };

  const handleDeleteNote = async (id: string) => {
    await baseTaskManagerApi.note.noteDelete(id);
    toast.success("Successfully created note");
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return (
    <div className="p-4">
      {/* Add Note Button */}
      <div className="flex justify-end mb-4">
        <Button startIcon={<PlusIcon />} onClick={openModal}>
          Add Note
        </Button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, index) => (
          <NoteCard index={index} note={note} onDelete={handleDeleteNote} />
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Create New Note
            </h5>
          </div>
          <div className="mt-8">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Title
              </label>
              <Input
                type="text"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                placeholder="Enter note title"
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Content
              </label>
              <TextArea
                value={newNote.content}
                onChange={(value) => setNewNote({ ...newNote, content: value })}
                placeholder="Write your note..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotesGrid;
