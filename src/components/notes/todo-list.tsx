'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const initialTodos: Todo[] = [
  { id: 1, text: 'Finalize Q3 budget report', completed: false },
  { id: 2, text: 'Schedule meeting with design team', completed: false },
  { id: 3, text: 'Pay credit card bill', completed: true },
  { id: 4, text: 'Book flights for vacation', completed: false },
];

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>To-Do List</CardTitle>
        <CardDescription>
          {completedCount} of {totalCount} tasks completed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Input 
            type="text" 
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="submit" size="icon" onClick={handleAddTodo}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center space-x-3">
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  todo.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {todo.text}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
