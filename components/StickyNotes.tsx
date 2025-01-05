'use client';

import { useState, useEffect,useRef } from 'react';
import { motion } from 'framer-motion';

interface StickyNote {
  id: number;
  content: string;
  color: string;
  position_x: number;
  position_y: number;
}

const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100',
    green: 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100',
    pink: 'bg-pink-100 dark:bg-pink-900/40 text-pink-900 dark:text-pink-100',
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
};

interface StickyNotesProps {
  userEmail: string | undefined;
}
  
export default function StickyNotes({ userEmail }: StickyNotesProps) {
    const [notes, setNotes] = useState<StickyNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [error, setError] = useState<string | null>(null);
    const colors = Object.keys(colorClasses);
    const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`https://www.abhisheks.live:5000/api/sticky-notes/${userEmail}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      setError('Failed to fetch notes');
      console.error('Failed to fetch notes:', error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const response = await fetch(`https://www.abhisheks.live:5000/api/sticky-notes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      setError('Failed to delete note');
      console.error('Failed to delete note:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setError(null);

    try {
      const response = await fetch('https://www.abhisheks.live:5000/api/sticky-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: userEmail,
          content: newNote,
          color: colors[Math.floor(Math.random() * colors.length)],
          position_x: 0,
          position_y: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const newNoteData = await response.json();
      setNotes(prevNotes => [...prevNotes, newNoteData]);
      setNewNote('');
    } catch (error) {
      setError('Failed to add note');
      console.error('Failed to add note:', error);
    }
  };

  const updateNotePosition = async (id: number, x: number, y: number) => {
    try {
      await fetch(`https://www.abhisheks.live:5000/api/sticky-notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position_x: x, position_y: y }),
      });
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  };

  const handleDragEnd = (id: number, info: any) => {
    const x = info.point.x;
    const y = info.point.y;
    updateNotePosition(id, x, y);
  };

  return (
    <div className="relative p-4 bg-white dark:bg-gray-800 rounded-lg transition-colors">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="p-2 flex-1 border dark:border-gray-600 rounded-lg 
            bg-white dark:bg-gray-700 
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            focus:border-transparent outline-none
            transition-colors"
          placeholder="Add a note..."
        />
        <button
          onClick={addNote}
          className="bg-blue-500 dark:bg-blue-600 
            hover:bg-blue-600 dark:hover:bg-blue-700
            text-white px-4 py-2 rounded-lg
            transition-colors duration-200"
        >
          Add Note
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 
          text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
      
      <div ref={containerRef} className="relative h-[400px] 
        bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            drag
            dragMomentum={false}
            dragConstraints={containerRef}
            initial={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              x: note.position_x,
              y: note.position_y
            }}
            className={`p-4 rounded-lg shadow-lg ${colorClasses[note.color]} 
              backdrop-blur-sm backdrop-filter
              border dark:border-gray-700/50
              transition-colors duration-200
              w-[200px] cursor-move`}
            onDragEnd={(_, info) => handleDragEnd(note.id, info)}
          >
            <button
              onClick={() => deleteNote(note.id)}
              className="float-right p-1 rounded-full
                text-gray-500 dark:text-gray-400 
                hover:text-red-500 dark:hover:text-red-400
                hover:bg-red-100 dark:hover:bg-red-900/30
                transition-colors"
            >
              ×
            </button>
            <p className="break-words">{note.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}