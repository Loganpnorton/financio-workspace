
import NotesArea from '@/components/notes/notes-area';
import TodoList from '@/components/notes/todo-list';

export default function NotesPage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Notes & To-Do</h1>
            <p className="text-muted-foreground">
            Organize your thoughts and tasks.
            </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-3">
            <NotesArea />
            </div>
            <div className="lg:col-span-2">
            <TodoList />
            </div>
        </div>
    </div>
  );
}
