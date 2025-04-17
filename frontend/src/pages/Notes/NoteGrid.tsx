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
import { NoteResponseModel } from "../../api/taskApiClient";

const NotesGrid = ({ isArchived }: { isArchived: boolean }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draggedNote, setDraggedNote] = useState<{
    id: string;
    pinned: boolean;
  } | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState<Note>({
    id: "",
    title: "",
    content: "",
  });

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await baseTaskManagerApi.notes.getAllNotes({isArchived: isArchived});
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
  }, [isArchived]);

  const { isOpen, openModal, closeModal } = useModal();

  const handleOpenAddModal = () => {
    setModalMode("add");
    setNoteForm({ id: "", title: "", content: "" });
    openModal();
  };

  const handleOpenEditModal = (id: string) => {
    const noteToEdit = notes.find((note) => note.id === id);
    if (noteToEdit) {
      setModalMode("edit");
      setEditNote(noteToEdit);
      setNoteForm({
        id: noteToEdit.id ?? "",
        title: noteToEdit.title,
        content: noteToEdit.content,
      });
      openModal();
    }
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() && !noteForm.content.trim()) return;

    if (modalMode === "add") {
      const saveNote = await baseTaskManagerApi.notes.createNote({
        title: noteForm.title,
        content: noteForm.content,
      });
      const newNote = {
        id: saveNote.data.id ?? "",
        title: noteForm.title,
        content: noteForm.content,
        pinned: false,
        color: "",
      };
      setNotes([...notes, newNote]);
      toast.success("Successfully created note");
    } else {
      if (editNote?.id) {
        try {
          await baseTaskManagerApi.notes.updateNote(editNote.id, {
            title: noteForm.title,
            content: noteForm.content,
          });
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === editNote.id
                ? { ...note, title: noteForm.title, content: noteForm.content }
                : note
            )
          );
          toast.success("Note updated successfully");
        } catch (error) {
          console.error("Failed to update note:", error);
          toast.error("Failed to update note");
          return;
        }
      }
    }

    setNoteForm({ id: "", title: "", content: "" });
    setEditNote(null);
    closeModal();
  };

  const handleCloseModal = () => {
    setNoteForm({ id: "", title: "", content: "" });
    setEditNote(null);
    closeModal();
  };

  const handleDeleteNote = async (id: string) => {
    await baseTaskManagerApi.notes.deleteNoteById(id);
    toast.success("Successfully deleted note");
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

  const handleDragStart = (id: string, pinned: boolean) => {
    setDraggedNote({ id, pinned });
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const handleDrop = async (targetId: string, pinned: boolean) => {
    if (
      !draggedNote ||
      draggedNote.id === targetId ||
      draggedNote.pinned !== pinned
    ) {
      return;
    }

    const draggedIndex = notes.findIndex((note) => note.id === draggedNote.id);
    const targetIndex = notes.findIndex((note) => note.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const reorderedNotes = [...notes];
    const [draggedNoteData] = reorderedNotes.splice(draggedIndex, 1);
    reorderedNotes.splice(targetIndex, 0, draggedNoteData);

    setNotes(reorderedNotes);

    try {
      const noteOrder = reorderedNotes
        .filter((note) => note.pinned === pinned)
        .map((note) => note.id!);
      await baseTaskManagerApi.notes.updateNoteOrder({
        order: noteOrder,
        pinned,
      });
      toast.success("Note order updated");
    } catch (error) {
      console.error("Failed to update note order:", error);
      toast.error("Failed to update note order");
      setNotes(notes);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Button
          size="tiny"
          startIcon={<PlusIcon />}
          onClick={handleOpenAddModal}
        >
          Add Note
        </Button>
      </div>

      {notes.filter((note: Note) => note.pinned).length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Pinned</h2>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 auto-rows-fr"
            onDragOver={(e) => e.preventDefault()}
          >
            {notes
              .filter((note) => note.pinned)
              .map((note, index) => (
                <div
                  key={note.id}
                  onDrop={() => note.id && handleDrop(note.id, true)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <NoteCard
                    index={index}
                    note={note}
                    onDelete={handleDeleteNote}
                    onPin={handlePinNote}
                    onColorChange={handleChangeNoteColor}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={handleOpenEditModal}
                  />
                </div>
              ))}
          </div>
        </>
      )}
      {notes.filter((note: Note) => note.pinned).length > 0 && (
        <h2 className="text-lg font-semibold mb-2">Other</h2>
      )}
      {notes.filter((note: Note) => !note.pinned).length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
          onDragOver={(e) => e.preventDefault()}
        >
          {notes
            .filter((note) => !note.pinned)
            .map((note, index) => (
              <div
                key={note.id}
                onDrop={() => note.id && handleDrop(note.id, false)}
                onDragOver={(e) => e.preventDefault()}
              >
                <NoteCard
                  index={index}
                  note={note}
                  onDelete={handleDeleteNote}
                  onPin={handlePinNote}
                  onColorChange={handleChangeNoteColor}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onEdit={handleOpenEditModal}
                />
              </div>
            ))}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {modalMode === "add" ? "Create New Note" : "Edit Note"}
            </h5>
          </div>
          <div className="mt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Title
              </label>
              <Input
                type="text"
                value={noteForm.title}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, title: e.target.value })
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
                value={noteForm.content}
                onChange={(value) =>
                  setNoteForm({ ...noteForm, content: value })
                }
                placeholder="Write your note..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <Button size="tiny" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button size="tiny" onClick={handleSaveNote}>
              {modalMode === "add" ? "Save" : "Update"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotesGrid;
