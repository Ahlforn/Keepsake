import type { NoteColor } from '../types';

export const COLORS: { value: NoteColor; label: string; swatch: string }[] = [
  { value: 'default', label: 'Paper', swatch: '#fefcf8' },
  { value: 'rose', label: 'Rose', swatch: '#fde4dc' },
  { value: 'amber', label: 'Amber', swatch: '#fbe8c2' },
  { value: 'sage', label: 'Sage', swatch: '#d9e6d2' },
  { value: 'sky', label: 'Sky', swatch: '#d4e4ec' },
  { value: 'lilac', label: 'Lilac', swatch: '#e3d8ec' },
  { value: 'stone', label: 'Stone', swatch: '#e6e0d6' },
];
