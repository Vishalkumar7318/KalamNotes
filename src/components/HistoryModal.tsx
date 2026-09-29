import React, { useState } from 'react';
import {
  History,
  X,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Search,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) =>
    item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-100 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Search & Notes History
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-semibold border border-stone-700">
                  {history.length} {history.length === 1 ? 'Topic' : 'Topics'}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                All your previously searched and generated notes are saved here
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2.5 py-1.5 rounded-lg border border-red-900/40 transition-colors cursor-pointer mr-8"
              title="Clear all history"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search Bar in History */}
        {history.length > 3 && (
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search previous topics..."
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {/* History List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-stone-800">
              <History className="w-10 h-10 text-stone-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-stone-400">No search history yet</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Type any topic or chapter in the search box and generate notes. They will automatically be saved here so you can revisit them anytime!
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-500">
              No previous notes matched &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group p-3.5 rounded-xl bg-stone-950/80 hover:bg-stone-950 border border-stone-800 hover:border-amber-500/50 shadow-sm transition-all flex items-center justify-between gap-3"
              >
                {/* Note Info */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                >
                  <div className="font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item.title || item.topic}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-stone-500" />
                      {item.targetPages || item.doc?.pages?.length || 1} Pages
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Open this note in notebook"
                  >
                    <span>Open Note</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
