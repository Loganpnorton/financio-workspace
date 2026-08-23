'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, FileText } from 'lucide-react';
import { Input } from '../ui/input';

type Note = {
  id: number;
  title: string;
  content: string;
};

const initialNotes: Note[] = [
  { id: 1, title: 'Meeting Prep Q4', content: 'Review sales data and prepare presentation slides.' },
  { id: 2, title: 'Vacation Ideas', content: '1. Bali, Indonesia\n2. Kyoto, Japan\n3. Swiss Alps' },
  { id: 3, title: 'Project Phoenix Kick-off', content: 'Define project scope, timeline, and deliverables.' },
];

export default function NotesArea() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectNote = (note: Note) => {
    setIsCreating(false);
    setSelectedNote(note);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedNote({ id: Date.now(), title: 'New Note', content: '' });
  };
  
  const handleSaveNote = () => {
    if (!selectedNote || !selectedNote.title.trim()) {
      // Maybe show a toast?
      return;
    }
    if (isCreating) {
      setNotes(prev => [...prev, selectedNote!]);
      setIsCreating(false);
    } else {
      setNotes(prev => prev.map(n => n.id === selectedNote!.id ? selectedNote! : n));
    }
  }
  
  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(notes.length > 1 ? notes.filter(n => n.id !== id)[0] : null);
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>My Notes</CardTitle>
          <CardDescription>Your personal notepad.</CardDescription>
        </div>
        <Button size="sm" onClick={handleCreateNew}><Plus className="mr-2 h-4 w-4" /> New Note</Button>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-4 h-[calc(100%-88px)]">
        <div className="col-span-1 border-r pr-4 overflow-y-auto">
            <div className="space-y-2">
                {notes.map(note => (
                    <Button 
                        key={note.id} 
                        variant={selectedNote?.id === note.id && !isCreating ? 'secondary' : 'ghost'} 
                        className="w-full justify-start"
                        onClick={() => handleSelectNote(note)}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="truncate">{note.title}</span>
                    </Button>
                ))}
            </div>
        </div>
        <div className="col-span-3">
          {selectedNote ? (
            <div className="flex flex-col h-full space-y-4">
              <Input 
                placeholder="Note title"
                className="text-lg font-semibold"
                value={selectedNote.title}
                onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
              />
              <Textarea
                placeholder="Start writing..."
                className="flex-grow text-base"
                value={selectedNote.content}
                onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
              />
              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteNote(selectedNote.id)}>
                      <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                  <Button onClick={handleSaveNote}>Save Note</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center bg-accent/50 rounded-md">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Select a note to view or create a new one.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
