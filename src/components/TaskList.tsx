import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, GripVertical, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  position: number;
}

interface TaskListProps {
  userId: string;
}

const TaskList = ({ userId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data || []);
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const maxPosition = tasks.length > 0 ? Math.max(...tasks.map((t) => t.position)) : -1;

    const { error } = await supabase.from("tasks").insert({
      user_id: userId,
      title: newTaskTitle,
      priority: newTaskPriority,
      position: maxPosition + 1,
    });

    if (error) {
      toast.error("Failed to add task");
      return;
    }

    setNewTaskTitle("");
    fetchTasks();
    toast.success("Task added!");
  };

  const toggleComplete = async (task: Task) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      })
      .eq("id", task.id);

    if (error) {
      toast.error("Failed to update task");
      return;
    }

    fetchTasks();
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      toast.error("Failed to delete task");
      return;
    }

    fetchTasks();
    toast.success("Task deleted");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newTasks);

    // Update positions in database
    const updates = newTasks.map((task, index) => ({
      id: task.id,
      position: index,
    }));

    for (const update of updates) {
      await supabase.from("tasks").update({ position: update.position }).eq("id", update.id);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tasks</h2>
        <p className="text-sm text-muted-foreground">Drag to reorder, click to complete</p>
      </div>

      {/* Add Task Form */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <select
          className="px-3 rounded-md border bg-background"
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <Button onClick={addTask} className="bg-gradient-to-r from-primary to-primary-glow">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Task List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleComplete(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tasks yet. Add one to get started!</p>
        </div>
      )}
    </Card>
  );
};

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: "bg-blue-500/10 border-blue-500/20",
    medium: "bg-amber-500/10 border-amber-500/20",
    high: "bg-red-500/10 border-red-500/20",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
        priorityColors[task.priority]
      } ${task.completed ? "opacity-50" : ""}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? "bg-primary border-primary"
            : "border-muted-foreground hover:border-primary"
        }`}
      >
        {task.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1">
        <p className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{task.priority} priority</p>
      </div>

      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
};

export default TaskList;
