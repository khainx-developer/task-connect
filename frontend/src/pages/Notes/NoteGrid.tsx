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
      const response = await baseTaskManagerApi.notes.getAllNotes();

      const notesData: Note[] = response.data.map(
        (note: NoteResponseModel) => ({
          id: note.id,
          pinned: note.pinned,
          title: note.title ?? "",
          color: note.color ?? "",
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

    const saveNote = await baseTaskManagerApi.notes.createNote({
      title: newNote.title,
      content: newNote.content,
    });
    newNote.id = saveNote.data.id ?? "";

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
    await baseTaskManagerApi.notes.deleteNoteById(id);
    toast.success("Successfully created note");
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const handlePinNote = async (id: string, pinned: boolean) => {
    await baseTaskManagerApi.notes.pinOrUnpinNote(id, pinned);
    toast.success(pinned ? "Pinned note" : "Unpinned note");
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, pinned: pinned } : note
      )
    );
  };

  const handleChangeNoteColor = async (id: string, color: string) => {
    await baseTaskManagerApi.notes.updateNoteColor(id, color);
    toast.success("Note color updated");
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, color: color } : note
      )
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Button startIcon={<PlusIcon />} onClick={openModal}>
          Add Note
        </Button>
      </div>

      {notes.filter((note: Note) => note.pinned).length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Pinned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {notes
              .filter((note) => note.pinned)
              .map((note, index) => (
                <NoteCard
                  key={note.id}
                  index={index}
                  note={note}
                  onDelete={handleDeleteNote}
                  onPin={handlePinNote}
                  onColorChange={handleChangeNoteColor}
                />
              ))}
          </div>
        </>
      )}
      {notes.filter((note: Note) => note.pinned).length > 0 && (
        <h2 className="text-lg font-semibold mb-2">Other</h2>
      )}
      {notes.filter((note: Note) => !note.pinned).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes
            .filter((note) => !note.pinned)
            .map((note, index) => (
              <NoteCard
                key={note.id}
                index={index}
                note={note}
                onDelete={handleDeleteNote}
                onPin={handlePinNote}
                onColorChange={handleChangeNoteColor}
              />
            ))}
        </div>
      )}

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
