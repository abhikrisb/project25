import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiPlus, FiCheck, FiCircle, FiClock, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { format, isPast } from 'date-fns';

interface Todo {
  id: number;
  user_email: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  due_date: string;
  reminder_sent: boolean;
}

export default function TodoSection() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    due_date: ''
  });

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/todos/${user?.email}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }
  };

  const sortTodos = (todos: Todo[]): Todo[] => {
    return [...todos].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return 0;
    });
  };

  const isPastDue = (dueDate: string): boolean => {
    if (!dueDate) return false;
    return isPast(new Date(dueDate));
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/todos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user?.email,
          title: newTodo.title,
          due_date: newTodo.due_date
        })
      });
      setNewTodo({ title: '', due_date: '' });
      fetchTodos();
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/todos/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchTodos();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchTodos();
    }
  }, [user]);

  return (
    <div className="space-y-4 bg-white dark:bg-gray-900 rounded-lg p-4 transition-colors">
      <form onSubmit={addTodo} className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newTodo.title}
              onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
              placeholder="Add new task..."
              className="w-full pl-3 pr-10 py-2 rounded-lg 
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-900
                text-gray-900 dark:text-gray-100 
                placeholder-gray-500 dark:placeholder-gray-400
                focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                outline-none transition-all"
            />
          </div>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="datetime-local"
              value={newTodo.due_date}
              onChange={(e) => setNewTodo({...newTodo, due_date: e.target.value})}
              className="pl-10 pr-3 py-2 rounded-lg
                border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-900
                text-gray-900 dark:text-gray-100
                focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                outline-none transition-all"
            />
          </div>
          <button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-700 text-white
              p-2 rounded-lg transition-colors duration-200
              flex items-center justify-center w-10 h-10"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      </form>
  
      <div className="space-y-2">
      {sortTodos(todos).map((todo) => (
          <div
            key={todo.id}
            className={`transform transition-all duration-300 ease-in-out 
              ${todo.is_completed ? 'opacity-60' : 'opacity-100'}
              ${todo.reminder_sent ? 'border-l-4 border-blue-500' : ''}
              group flex items-center justify-between
              bg-gray-50 dark:bg-gray-800 p-4 rounded-lg
              shadow-sm hover:shadow-md cursor-pointer`}
            onClick={() => toggleTodo(todo.id)}
          >
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-orange-500 transition-colors">
                {todo.is_completed ? 
                  <FiCheck className="w-5 h-5 text-orange-500" /> : 
                  <FiCircle className="w-5 h-5" />
                }
              </button>
              <span className={`
                ${todo.is_completed 
                  ? "line-through text-gray-400 dark:text-gray-500" 
                  : "text-gray-900 dark:text-gray-100"}
                ${isPastDue(todo.due_date) && !todo.is_completed 
                  ? "text-red-600 dark:text-red-400" 
                  : ""}
              `}>
                {todo.title}
              </span>
              {todo.reminder_sent && (
                <span className="text-xs text-blue-500">
                  Reminder sent
                </span>
              )}              
            </div>
            {todo.due_date && (
              <div className={`flex items-center space-x-2 text-sm 
                ${isPastDue(todo.due_date) && !todo.is_completed 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-gray-500 dark:text-gray-400"}`}
              >
                {isPastDue(todo.due_date) && !todo.is_completed ? 
                  <FiAlertCircle className="w-4 h-4" /> : 
                  <FiClock className="w-4 h-4" />
                }
                <span>
                  {format(new Date(todo.due_date), 'MMM d, h:mm a')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}