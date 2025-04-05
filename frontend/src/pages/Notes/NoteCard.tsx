import { Note } from "./note";

const NoteCard = ({ index, note }: { index: number; note: Note }) => {
  return (
    <div
      key={index}
      className={`rounded-xl shadow-md p-4 ${note.color} hover:shadow-lg transition duration-300`}
    >
      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
      <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
    </div>
  );
};

export default NoteCard;
