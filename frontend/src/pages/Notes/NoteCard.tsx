import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faThumbtack,
  faPalette,
  faEdit,
  faPlus,
  faTimes,
  faGripVertical,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { Note } from "./note";
import { useState } from "react";
import { baseTaskManagerApi } from "../../api";
import { toast } from "react-toastify";
import { NoteType } from "../../api/taskApiClient";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { CheckLineIcon, CloseLineIcon } from "../../icons";

const NoteCard = ({
  note,
  onDelete,
  onPin,
  onColorChange,
  onEdit,
  setNote,
  isLoading,
  dragHandleProps,
  isArchived,
  onRecover,
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
  isLoading?: boolean;
  dragHandleProps?: any;
  isArchived?: boolean;
  onRecover?: (id: string) => void;
}) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isItemLoading, setIsItemLoading] = useState(false);

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

    setIsItemLoading(true);
    try {
      await baseTaskManagerApi.notes.updateInsertChecklistItem(note.id, {
        id: itemId,
        text:
          note.checklistItems?.find((item) => item.id === itemId)?.text || "",
        isCompleted: !isCompleted,
        order:
          note.checklistItems?.find((item) => item.id === itemId)?.order || 0,
      });
      await refreshNote();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
      toast.error("Failed to update checklist item");
    } finally {
      setIsItemLoading(false);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!note.id || !newItemText.trim()) {
      toast.error("Please enter a valid checklist item");
      return;
    }

    setIsItemLoading(true);
    try {
      await baseTaskManagerApi.notes.updateInsertChecklistItem(note.id, {
        id: null,
        text: newItemText,
        isCompleted: false,
        order: note.checklistItems?.length ?? 0,
      });
      setNewItemText("");
      await refreshNote();
    } catch (error) {
      console.error("Failed to add checklist item:", error);
      toast.error("Failed to add checklist item");
    } finally {
      setIsItemLoading(false);
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

    setIsItemLoading(true);
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
      setEditItemId(null);
      setEditText("");
      await refreshNote();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
      toast.error("Failed to update checklist item");
    } finally {
      setIsItemLoading(false);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string | null) => {
    if (!note.id || !itemId) return;

    setIsItemLoading(true);
    try {
      await baseTaskManagerApi.notes.deleteChecklistItem(note.id, itemId);
      await refreshNote();
    } catch (error) {
      console.error("Failed to delete checklist item:", error);
      toast.error("Failed to delete checklist item");
    } finally {
      setIsItemLoading(false);
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
    setIsItemLoading(true);
    try {
      for (let i = 0; i < updatedItems.length; i++) {
        await baseTaskManagerApi.notes.updateInsertChecklistItem(note.id, {
          id: updatedItems[i].id,
          text: updatedItems[i].text,
          isCompleted: updatedItems[i].isCompleted,
          order: i,
        });
      }
      await refreshNote();
    } catch (error) {
      console.error("Failed to reorder checklist items:", error);
      toast.error("Failed to reorder checklist items");
      await refreshNote();
    } finally {
      setIsItemLoading(false);
    }
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 p-4 max-w-full ${note.color || "bg-white"} flex flex-col relative mb-4 break-inside-avoid ${
        (isLoading || isItemLoading) ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {(isLoading || isItemLoading) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
        </div>
      )}
      {dragHandleProps ? (
        <h3 className="font-semibold text-lg mb-2 cursor-move break-words" {...dragHandleProps}>{note.title}</h3>
      ) : (
        <h3 className="font-semibold text-lg mb-2 cursor-move break-words">{note.title}</h3>
      )}
      {note.type === NoteType.Checklist ? (
        <div className="flex-grow">
          <DragDropContext onDragEnd={onChecklistDragEnd}>
            <Droppable droppableId={`checklist-${note.id}`}>
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1"
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
                                  disabled={isItemLoading || isArchived}
                                />
                                <button
                                  onClick={() => item.id && handleSaveEdit(item.id)}
                                  type="button"
                                  className="ml-2 text-green-500 hover:text-green-700"
                                  disabled={isItemLoading || isArchived}
                                  aria-label="Save"
                                >
                                  <CheckLineIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  type="button"
                                  className="ml-2 text-red-500 hover:text-red-700"
                                  disabled={isItemLoading || isArchived}
                                  aria-label="Cancel"
                                >
                                  <CloseLineIcon className="h-5 w-5" />
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
                                  disabled={!item.id || isItemLoading || isArchived}
                                />
                                <span
                                  className={
                                    item.isCompleted ? "line-through text-gray-500" : ""
                                  }
                                  onClick={() =>
                                    !isArchived && item.id && handleEditChecklistItem(item.id, item.text)
                                  }
                                  style={{ cursor: isArchived ? "default" : "pointer" }}
                                >
                                  {item.text}
                                </span>
                                {!isArchived && (
                                  <button
                                    onClick={() => item.id && handleDeleteChecklistItem(item.id)}
                                    type="button"
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    disabled={isItemLoading}
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                  </button>
                                )}
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
          {!isArchived && (
            <div className="mt-2 flex items-center">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add item..."
                className="flex-grow p-1 border rounded"
                disabled={isItemLoading}
              />
              <button
                onClick={handleAddChecklistItem}
                type="button"
                className="ml-2 text-blue-500 hover:text-blue-700"
                disabled={isItemLoading}
              >
                <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-line break-words">
          {note.content}
        </p>
      )}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2 items-center">
          {!isArchived && (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowColorMenu((prev) => !prev)}
                  type="button"
                  className="text-gray-600 hover:text-gray-800"
                  disabled={isLoading || isItemLoading}
                >
                  <FontAwesomeIcon icon={faPalette} className="h-5 w-5" />
                </button>
                {showColorMenu && (
                  <div className="absolute z-10 mt-2 flex gap-1 bg-white p-2 rounded shadow-md">
                    <button
                      type="button"
                      className="w-5 h-5 rounded-full bg-white border-2 border-gray-300 hover:ring-2 flex items-center justify-center"
                      onClick={() => handleColorChange("")}
                      disabled={isLoading || isItemLoading}
                      title="Clear color"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-3 w-3 text-gray-500" />
                    </button>
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-5 h-5 rounded-full ${color} border-2 border-white hover:ring-2`}
                        onClick={() => handleColorChange(color)}
                        disabled={isLoading || isItemLoading}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => note.id && onEdit(note.id)}
                type="button"
                className="text-blue-500 hover:text-blue-700"
                disabled={isLoading || isItemLoading}
              >
                <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
              </button>
            </>
          )}
          <div className="flex gap-2">
            {isArchived && onRecover && (
              <button
                onClick={() => note.id && onRecover(note.id)}
                type="button"
                className="text-green-500 hover:text-green-700"
                disabled={isLoading || isItemLoading}
              >
                <FontAwesomeIcon icon={faUndo} className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleDelete}
              type="button"
              className="text-red-500 hover:text-red-700"
              disabled={isLoading || isItemLoading}
            >
              <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
            </button>
          </div>
        </div>
        {!isArchived && (
          <button
            onClick={handlePin}
            type="button"
            className={`hover:text-blue-700 ${note.pinned ? "text-blue-500 font-bold" : "text-blue-200"}`}
            disabled={isLoading || isItemLoading}
          >
            <FontAwesomeIcon icon={faThumbtack} className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteCard;