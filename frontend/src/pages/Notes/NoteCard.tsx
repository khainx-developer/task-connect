import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faThumbtack,
  faPalette,
  faEdit,
  faPlus,
  faTimes,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import { Note } from "./note";
import { useState } from "react";
import { baseTaskManagerApi } from "../../api";
import { toast } from "react-toastify";
import { NoteType } from "../../api/taskApiClient";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

const NoteCard = ({
  note,
  onDelete,
  onPin,
  onColorChange,
  onEdit,
  setNote,
}: {
  index: number;
  note: Note;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onColorChange: (id: string, color: string) => void;
  onDragStart: (id: string, pinned: boolean) => void;
  onDragEnd: () => void;
  onEdit: (id: string) => void;
  setNote: (updatedNote: Note) => void;
}) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const colors = [
    "bg-red-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-pink-100",
    "bg-purple-100",
    "bg-gray-100",
  ];

  const handleDelete = () => {
    if (note.id) {
      onDelete(note.id);
    }
  };

  const handlePin = () => {
    if (note.id) {
      onPin(note.id, !note.pinned);
    }
  };

  const handleColorChange = (color: string) => {
    if (note.id) {
      onColorChange(note.id, color);
      setShowColorMenu(false);
    }
  };

  const refreshNote = async () => {
    if (!note.id) return;

    try {
      const response = await baseTaskManagerApi.notes.getNoteById(note.id);
      const updatedNote: Note = {
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
      setNote(updatedNote);
    } catch (error) {
      console.error("Failed to refresh note:", error);
      toast.error("Failed to refresh note");
    }
  };

  const handleToggleChecklistItem = async (
    itemId: string | null,
    isCompleted: boolean
  ) => {
    if (!note.id || !itemId) return;

    try {
      await baseTaskManagerApi.notes.updateInsertChecklistItem(note.id, {
        id: itemId,
        text:
          note.checklistItems?.find((item) => item.id === itemId)?.text || "",
        isCompleted: !isCompleted,
        order:
          note.checklistItems?.find((item) => item.id === itemId)?.order || 0,
      });
      toast.success("Checklist item updated");
      await refreshNote();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
      toast.error("Failed to update checklist item");
    }
  };

  const handleAddChecklistItem = async () => {
    if (!note.id || !newItemText.trim()) {
      toast.error("Please enter a valid checklist item");
      return;
    }

    try {
      await baseTaskManagerApi.notes.updateInsertChecklistItem(note.id, {
        id: null,
        text: newItemText,
        isCompleted: false,
        order: note.checklistItems?.length ?? 0,
      });
      toast.success("Checklist item added");
      setNewItemText("");
      await refreshNote();
    } catch (error) {
      console.error("Failed to add checklist item:", error);
      toast.error("Failed to add checklist item");
    }
  };

  const handleEditChecklistItem = (itemId: string | null, text: string) => {
    setEditItemId(itemId);
    setEditText(text);
  };

  const handleSaveEdit = async (itemId: string | null) => {
    if (!note.id || !itemId || !editText.trim()) {
      toast.error("Please enter a valid checklist item");
      return;
    }

    try {
      await baseTaskManagerApi.notes.updateInsertChecklistItem(note.id, {
        id: itemId,
        text: editText,
        isCompleted:
          note.checklistItems?.find((item) => item.id === itemId)
            ?.isCompleted || false,
        order:
          note.checklistItems?.find((item) => item.id === itemId)?.order || 0,
      });
      toast.success("Checklist item updated");
      setEditItemId(null);
      setEditText("");
      await refreshNote();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
      toast.error("Failed to update checklist item");
    }
  };

  const handleDeleteChecklistItem = async (itemId: string | null) => {
    if (!note.id || !itemId) return;

    try {
      await baseTaskManagerApi.notes.deleteChecklistItem(note.id, itemId);
      toast.success("Checklist item deleted");
      await refreshNote();
    } catch (error) {
      console.error("Failed to delete checklist item:", error);
      toast.error("Failed to delete checklist item");
    }
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
    setEditText("");
  };

  const onChecklistDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || !note.id) {
      return;
    }

    const updatedItems = Array.from(note.checklistItems ?? []);
    const [movedItem] = updatedItems.splice(source.index, 1);
    updatedItems.splice(destination.index, 0, movedItem);

    // Update order for all items
    updatedItems.forEach((item, index) => {
      item.order = index;
    });

    // Update local state immediately
    setNote({ ...note, checklistItems: updatedItems });

    // Persist the new order to the backend
    try {
      for (let i = 0; i < updatedItems.length; i++) {
        await baseTaskManagerApi.notes.updateInsertChecklistItem(note.id, {
          id: updatedItems[i].id,
          text: updatedItems[i].text,
          isCompleted: updatedItems[i].isCompleted,
          order: i,
        });
      }
      toast.success("Checklist items reordered");
      await refreshNote();
    } catch (error) {
      console.error("Failed to reorder checklist items:", error);
      toast.error("Failed to reorder checklist items");
      await refreshNote();
    }
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 p-4 ${note.color || "bg-white"} mb-3 flex flex-col h-72`}
    >
      <h3 className="font-semibold text-lg mb-2 cursor-move">{note.title}</h3>
      {note.type === NoteType.Checklist ? (
        <div className="flex-grow overflow-y-auto">
          <DragDropContext onDragEnd={onChecklistDragEnd}>
            <Droppable droppableId={`checklist-${note.id}`}>
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {note.checklistItems
                    ?.sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <Draggable
                        key={item.id || item.text}
                        draggableId={item.id || item.text}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center mb-2"
                          >
                            {editItemId === item.id ? (
                              <div className="flex items-center w-full">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="flex-grow p-1 border rounded"
                                  autoFocus
                                />
                                <button
                                  onClick={() => item.id && handleSaveEdit(item.id)}
                                  className="ml-2 text-green-500 hover:text-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center w-full">
                                <span
                                  {...provided.dragHandleProps}
                                  className="mr-2 text-gray-400 cursor-move"
                                >
                                  <FontAwesomeIcon icon={faGripVertical} className="h-4 w-4" />
                                </span>
                                <input
                                  type="checkbox"
                                  checked={item.isCompleted}
                                  onChange={() =>
                                    item.id &&
                                    handleToggleChecklistItem(item.id, item.isCompleted)
                                  }
                                  className="mr-2"
                                  disabled={!item.id}
                                />
                                <span
                                  className={
                                    item.isCompleted ? "line-through text-gray-500" : ""
                                  }
                                  onClick={() =>
                                    item.id && handleEditChecklistItem(item.id, item.text)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  {item.text}
                                </span>
                                <button
                                  onClick={() => item.id && handleDeleteChecklistItem(item.id)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </li>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          <div className="mt-2 flex items-center">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add item..."
              className="flex-grow p-1 border rounded"
            />
            <button
              onClick={handleAddChecklistItem}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-line flex-grow overflow-y-auto">
          {note.content}
        </p>
      )}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <button
              onClick={() => setShowColorMenu((prev) => !prev)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FontAwesomeIcon icon={faPalette} className="h-5 w-5" />
            </button>
            {showColorMenu && (
              <div className="absolute z-10 mt-2 flex gap-1 bg-white p-2 rounded shadow-md">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-full ${color} border-2 border-white hover:ring-2`}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => note.id && onEdit(note.id)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={handlePin}
          className={`hover:text-blue-700 ${note.pinned ? "text-blue-500 font-bold" : "text-blue-200"}`}
        >
          <FontAwesomeIcon icon={faThumbtack} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;