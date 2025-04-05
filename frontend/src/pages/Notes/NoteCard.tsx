import { Note } from "./note";

const NoteCard = ({
  index,
  note,
  onDelete,
}: {
  index: number;
  note: Note;
  onDelete: (id: string) => void;
}) => {
  const handleDelete = () => {
    if (note.id) {
      onDelete(note.id);
    }
  };

  return (
    <div
      key={index}
      className={`rounded-xl shadow-md p-4 ${note.color} hover:shadow-lg transition duration-300`}
    >
      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
      <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
      <button
        onClick={handleDelete}
        className="text-red-500 hover:text-red-700"
      >
        Delete
      </button>
    </div>
  );
};

export default NoteCard;
