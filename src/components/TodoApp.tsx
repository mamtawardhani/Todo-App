import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type FilterType = 'all' | 'active' | 'completed';

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        setTodos(parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        })));
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
      toast({
        title: "Task added",
        description: "Your new task has been created successfully.",
      });
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast({
      title: "Task removed",
      description: "The task has been deleted.",
      variant: "destructive"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-semibold text-foreground mb-2 font-serif">
            Tasks
          </h1>
          <p className="text-muted-foreground">
            Organize your work and life, finally.
          </p>
        </div>

        {/* Add Todo */}
        <Card className="p-6 mb-8 shadow-custom-md animate-fade-in">
          <div className="flex gap-3">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-base border-0 bg-muted focus:ring-1 focus:ring-primary/20"
            />
            <Button 
              onClick={addTodo}
              variant="default"
              size="lg"
              className="px-6 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Stats & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-3">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              {stats.total} total
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              {stats.active} active
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              {stats.completed} done
            </Badge>
          </div>

          <div className="flex gap-1">
            {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "ghost"}
                onClick={() => setFilter(filterType)}
                size="sm"
                className="px-4"
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodos.length === 0 ? (
            <Card className="p-12 text-center shadow-custom">
              <div className="text-muted-foreground">
                {filter === 'all' && "No tasks yet. Create your first task above."}
                {filter === 'active' && "No active tasks. You're all caught up!"}
                {filter === 'completed' && "No completed tasks yet."}
              </div>
            </Card>
          ) : (
            filteredTodos.map((todo, index) => (
              <Card 
                key={todo.id} 
                className="p-4 shadow-custom hover:shadow-custom-md transition-all duration-200 animate-slide-up group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex-shrink-0 transition-all duration-200"
                  >
                    {todo.completed ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p 
                      className={`text-base leading-relaxed ${
                        todo.completed 
                          ? 'line-through text-muted-foreground' 
                          : 'text-foreground'
                      } transition-all duration-200`}
                    >
                      {todo.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {todo.createdAt.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-destructive p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="text-center mt-12 text-muted-foreground animate-fade-in">
            <p className="text-sm">
              {stats.active === 0 
                ? "All tasks completed. Great work!" 
                : `${stats.active} task${stats.active !== 1 ? 's' : ''} remaining`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;