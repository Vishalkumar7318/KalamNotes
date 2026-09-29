import React, { useState } from 'react';
import { StickyNoteItem, StickyColor } from '../types';
import { Trash2, Pin, Palette } from 'lucide-react';

interface StickyNoteProps {
  note: StickyNoteItem;
  onUpdate: (updated: StickyNoteItem) => void;
  onDelete: (id: string) => void;
  editable?: boolean;
}

const COLOR_CLASSES: Record<StickyColor, { bg: string; border: string; tape: string }> = {
  yellow: {
    bg: 'bg-amber-100 text-amber-950',
    border: 'border-amber-300',
    tape: 'washi-tape',
  },
  pink: {
    bg: 'bg-pink-100 text-pink-950',
    border: 'border-pink-300',
    tape: 'washi-tape-pink',
  },
  blue: {
    bg: 'bg-sky-100 text-sky-950',
    border: 'border-sky-300',
    tape: 'washi-tape-blue',
  },
  green: {
    bg: 'bg-emerald-100 text-emerald-950',
    border: 'border-emerald-300',
    tape: 'washi-tape',
  },
  orange: {
    bg: 'bg-orange-100 text-orange-950',
    border: 'border-orange-300',
    tape: 'washi-tape',
  },
  purple: {
    bg: 'bg-purple-100 text-purple-950',
    border: 'border-purple-300',
    tape: 'washi-tape-pink',
  },
};

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  editable = true,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorConfig = COLOR_CLASSES[note.color] || COLOR_CLASSES.yellow;

  const handleColorChange = (newColor: StickyColor) => {
    onUpdate({ ...note, color: newColor });
    setShowColorPicker(false);
  };

  const colors: StickyColor[] = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple'];

  return (
    <div
      className={`relative rounded-sm p-3.5 shadow-md border transition-transform hover:scale-[1.02] hover:z-20 ${colorConfig.bg} ${colorConfig.border} group`}
      style={{
        transform: `rotate(${note.rotation || 0}deg)`,
      }}
    >
      {/* Pinned tape effect at the top */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 washi-tape opacity-85 pointer-events-none rounded-[1px]" />

      {/* Action controls (visible on hover) */}
      {editable && (
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change Note Color"
            className="p-1 hover:bg-black/10 rounded text-stone-700"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            title="Delete Sticky Note"
            className="p-1 hover:bg-red-500/20 text-red-600 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div className="absolute top-8 right-2 z-30 flex items-center gap-1 p-1.5 bg-white rounded-lg shadow-lg border border-stone-200 no-print">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              className={`w-5 h-5 rounded-full border border-stone-300 ${
                c === 'yellow' ? 'bg-amber-300' :
                c === 'pink' ? 'bg-pink-300' :
                c === 'blue' ? 'bg-sky-300' :
                c === 'green' ? 'bg-emerald-300' :
                c === 'orange' ? 'bg-orange-300' : 'bg-purple-300'
              } ${note.color === c ? 'ring-2 ring-stone-800' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <div className="flex items-center gap-1.5 mb-1.5 font-bold text-sm tracking-wide border-b border-black/10 pb-1">
        <Pin className="w-3 h-3 text-stone-500 shrink-0" />
        {editable ? (
          <input
            type="text"
            value={note.title || ''}
            onChange={(e) => onUpdate({ ...note, title: e.target.value })}
            placeholder="Sticky Note Title"
            className="w-full bg-transparent focus:outline-none focus:bg-white/40 px-1 rounded font-bold"
          />
        ) : (
          <span>{note.title}</span>
        )}
      </div>

      {/* Content */}
      {editable ? (
        <textarea
          value={note.content}
          onChange={(e) => onUpdate({ ...note, content: e.target.value })}
          rows={3}
          placeholder="Write exam hack or memory trick..."
          className="w-full bg-transparent focus:outline-none focus:bg-white/40 p-1 rounded resize-none text-[13px] leading-relaxed"
        />
      ) : (
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{note.content}</p>
      )}
    </div>
  );
};
