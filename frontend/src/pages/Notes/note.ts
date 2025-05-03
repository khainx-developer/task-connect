import { NoteType } from "../../api/taskApiClient";

export interface ChecklistItem {
  id?: string | null;
  text: string;
  isCompleted: boolean;
  order: number;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  color?: string;
  pinned?: boolean;
  type: NoteType;
  checklistItems?: ChecklistItem[];
}
