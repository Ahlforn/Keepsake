export type NoteColor =
  | 'default'
  | 'rose'
  | 'amber'
  | 'sage'
  | 'sky'
  | 'lilac'
  | 'stone';

export interface Tag {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  attachments: Attachment[];
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface NoteInput {
  title?: string;
  content?: string;
  color?: NoteColor;
  pinned?: boolean;
  archived?: boolean;
  tags?: string[];
}
