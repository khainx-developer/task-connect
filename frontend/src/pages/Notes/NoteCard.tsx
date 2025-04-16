import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faThumbtack,
  faPalette,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

import { Note } from "./note";
import { useState } from "react";

const NoteCard = ({
  index,
  note,
  onDelete,
  onPin,
  onColorChange,
  onDragStart,
  onDragEnd,
  onEdit,
}: {
  index: number;
  note: Note;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onColorChange: (id: string, color: string) => void;
  onDragStart: (id: string, pinned: boolean) => void;
  onDragEnd: () => void;
  onEdit: (id: string) => void;
}) => {
  const [showColorMenu, setShowColorMenu] = useState(false);

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
      note.color = color; // Update the note's color immediately
    }
  };

  console.log("note color", note.color);

  return (
    <div
      key={index}
      className={`rounded-xl border border-gray-200 p-4 ${note.color} mb-3 cursor-move`}
      draggable
      onDragStart={() => note.id && onDragStart(note.id, !!note.pinned)}
      onDragEnd={onDragEnd}
    >
      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
      <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
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
          className={`hover:text-blue-700 ${
            note.pinned ? "text-blue-500 font-bold" : "text-blue-200"
          }`}
        >
          <FontAwesomeIcon icon={faThumbtack} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;