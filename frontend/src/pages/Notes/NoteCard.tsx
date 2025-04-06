import { Note } from "./note";

const NoteCard = ({
  index,
  note,
  onDelete,
  onPin,
}: {
  index: number;
  note: Note;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
}) => {
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

  return (
    <div
      key={index}
      className={`rounded-xl shadow-md p-4 ${note.color} hover:shadow-lg transition duration-300`}
    >
      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
      <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
        <button
          onClick={handlePin}
          className="text-blue-500 hover:text-blue-700"
        >
          {note.pinned ? "Unpin" : "Pin"}
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
