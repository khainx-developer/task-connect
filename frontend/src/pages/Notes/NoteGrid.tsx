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
import { NoteResponseModel, NoteType } from "../../api/taskApiClient";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

const NotesGrid = ({ isArchived }: { isArchived: boolean }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState<Note>({
    id: "",
    title: "",
    content: "",
    type: NoteType.Text,
  });

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await baseTaskManagerApi.notes.getAllNotes({
        isArchived,
      });
      const notesData: Note[] = response.data.map(
        (note: NoteResponseModel) => ({
          id: note.id,
          pinned: note.pinned,
          title: note.title ?? "",
          color: note.color ?? "",
          content: note.content ?? "",
          type: note.type ?? NoteType.Text,
          checklistItems:
            note.checklistItems?.map((item) => ({
              id: item.id,
              text: item.text ?? "",
              isCompleted: item.isCompleted ?? false,
              order: item.order ?? 0,
            })) ?? [],
        })
      );
      setNotes(notesData);
    };

    fetchNotes();
  }, [isArchived]);

  const { isOpen, openModal, closeModal } = useModal();

  const handleOpenAddModal = () => {
    setModalMode("add");
    setNoteForm({ id: "", title: "", content: "", type: NoteType.Text });
    openModal();
  };

  const handleOpenEditModal = async (id: string) => {
    try {
      const response = await baseTaskManagerApi.notes.getNoteById(id);
      const noteToEdit: Note = {
        id: response.data.id,
        title: response.data.title ?? "",
        content: response.data.content ?? "",
        type: response.data.type ?? NoteType.Text,
        checklistItems:
          response.data.checklistItems?.map((item) => ({
            id: item.id,
            text: item.text ?? "",
            isCompleted: item.isCompleted ?? false,
            order: item.order ?? 0,
          })) ?? [],
        pinned: response.data.pinned,
        color: response.data.color ?? "",
      };
      setModalMode("edit");
      setEditNote(noteToEdit);
      setNoteForm({
        id: noteToEdit.id ?? "",
        title: noteToEdit.title,
        content: noteToEdit.content,
        type: noteToEdit.type,
      });
      openModal();
    } catch (error) {
      console.error("Failed to fetch note:", error);
      toast.error("Failed to fetch note");
    }
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() && !noteForm.content.trim()) return;

    const noteData = {
      title: noteForm.title,
      content: noteForm.type === NoteType.Text ? noteForm.content : "",
      type: noteForm.type,
    };

    if (modalMode === "add") {
      try {
        const saveNote = await baseTaskManagerApi.notes.createNote(noteData);
        const newNote: Note = {
          id: saveNote.data.id ?? "",
          title: noteForm.title,
          content: noteForm.content,
          type: noteForm.type,
          checklistItems: [],
          pinned: false,
          color: "",
        };
        setNotes([...notes, newNote]);
        toast.success("Successfully created note");
      } catch (error) {
        console.error("Failed to create note:", error);
        toast.error("Failed to create note");
        return;
      }
    } else {
      if (editNote?.id) {
        try {
          await baseTaskManagerApi.notes.updateNote(editNote.id, noteData);
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === editNote.id ? { ...note, ...noteData } : note
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

    setNoteForm({ id: "", title: "", content: "", type: NoteType.Text });
    setEditNote(null);
    closeModal();
  };

  const handleCloseModal = () => {
    setNoteForm({ id: "", title: "", content: "", type: NoteType.Text });
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
      prevNotes.map((note) => (note.id === id ? { ...note, pinned } : note))
    );
  };

  const handleChangeNoteColor = async (id: string, color: string) => {
    await baseTaskManagerApi.notes.updateNoteColor(id, color);
    toast.success("Note color updated");
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, color } : note))
    );
  };

  const handleSetNote = (id: string, updatedNote: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? updatedNote : note))
    );
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const isPinned = draggableId === "pinned";
    const filteredNotes = notes.filter((note) => note.pinned === isPinned);
    const otherNotes = notes.filter((note) => note.pinned !== isPinned);

    if (source.droppableId !== destination.droppableId) {
      return; // Prevent dragging between pinned and unpinned sections
    }

    const reorderedNotes = Array.from(filteredNotes);
    const [movedNote] = reorderedNotes.splice(source.index, 1);
    reorderedNotes.splice(destination.index, 0, movedNote);

    // Update the notes state
    setNotes([...otherNotes, ...reorderedNotes]);

    // Persist the new order to the backend
    try {
      const noteOrder = reorderedNotes.map((note) => note.id!);
      await baseTaskManagerApi.notes.updateNoteOrder({
        order: noteOrder,
        pinned: isPinned,
      });
      toast.success("Note order updated");
    } catch (error) {
      console.error("Failed to update note order:", error);
      toast.error("Failed to update note order");
      setNotes(notes); // Revert on failure
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

      <DragDropContext onDragEnd={onDragEnd}>
        {notes.filter((note: Note) => note.pinned).length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-2">Pinned</h2>
            <Droppable droppableId="pinned">
              {(provided) => (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 auto-rows-fr"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {notes
                    .filter((note) => note.pinned)
                    .map((note, index) => (
                      <Draggable
                        key={note.id}
                        draggableId={note.id!}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <NoteCard
                              index={index}
                              note={note}
                              onDelete={handleDeleteNote}
                              onPin={handlePinNote}
                              onColorChange={handleChangeNoteColor}
                              onDragStart={() => {}}
                              onDragEnd={() => {}}
                              onEdit={handleOpenEditModal}
                              setNote={(updatedNote) =>
                                note.id && handleSetNote(note.id, updatedNote)
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </>
        )}

        {notes.filter((note: Note) => note.pinned).length > 0 && (
          <h2 className="text-lg font-semibold mb-2">Other</h2>
        )}

        {notes.filter((note: Note) => !note.pinned).length > 0 && (
          <Droppable droppableId="unpinned">
            {(provided) => (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {notes
                  .filter((note) => !note.pinned)
                  .map((note, index) => (
                    <Draggable
                      key={note.id}
                      draggableId={note.id!}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <NoteCard
                            index={index}
                            note={note}
                            onDelete={handleDeleteNote}
                            onPin={handlePinNote}
                            onColorChange={handleChangeNoteColor}
                            onDragStart={() => {}}
                            onDragEnd={() => {}}
                            onEdit={handleOpenEditModal}
                            setNote={(updatedNote) =>
                              note.id && handleSetNote(note.id, updatedNote)
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </DragDropContext>

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
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Note Type
              </label>
              <select
                value={noteForm.type}
                onChange={(e) =>
                  setNoteForm({
                    ...noteForm,
                    type: Number(e.target.value) as NoteType,
                  })
                }
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              >
                <option value={NoteType.Text}>Text</option>
                <option value={NoteType.Checklist}>Checklist</option>
              </select>
            </div>
            {noteForm.type === NoteType.Text && (
              <div className="mt-4">
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
            )}
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