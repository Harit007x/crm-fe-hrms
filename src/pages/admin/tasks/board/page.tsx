import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

// Types
type Task = {
  id: string;
  content: string;
  priority: "Low" | "Medium" | "High";
  assignee: string;
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

type BoardData = {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
};

// Initial Data
const initialData: BoardData = {
  tasks: {
    "task-1": { id: "task-1", content: "Design landing page", priority: "High", assignee: "Alice" },
    "task-2": { id: "task-2", content: "Integrate Stripe API", priority: "High", assignee: "Bob" },
    "task-3": { id: "task-3", content: "Create database schema", priority: "Medium", assignee: "Charlie" },
    "task-4": { id: "task-4", content: "Write API docs", priority: "Low", assignee: "Alice" },
    "task-5": { id: "task-5", content: "Fix login bug", priority: "High", assignee: "Bob" },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "Backlog",
      taskIds: ["task-1", "task-2"],
    },
    "column-2": {
      id: "column-2",
      title: "To Do",
      taskIds: ["task-3"],
    },
    "column-3": {
      id: "column-3",
      title: "In Progress",
      taskIds: ["task-4"],
    },
    "column-4": {
      id: "column-4",
      title: "Review",
      taskIds: ["task-5"],
    },
    "column-5": {
      id: "column-5",
      title: "Done",
      taskIds: [],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3", "column-4", "column-5"],
};

export default function TasksBoardPage() {
  const [data, setData] = useState<BoardData>(initialData);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-4 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kanban Board</h2>
          <p className="text-muted-foreground text-sm">Drag and drop tasks to update their status.</p>
        </div>
        <Button>
          <Icons.add className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-xl border bg-card p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-4 min-w-max">
            {data.columnOrder.map((columnId) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

              return (
                <div key={column.id} className="flex flex-col bg-secondary/50 rounded-lg w-80">
                  <div className="p-3 font-semibold flex justify-between items-center text-sm border-b border-border/50">
                    <span>{column.title}</span>
                    <Badge variant="secondary">{tasks.length}</Badge>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-2 space-y-2 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-secondary' : ''}`}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-card rounded-md p-3 border shadow-sm flex flex-col gap-2 ${snapshot.isDragging ? 'shadow-lg border-primary ring-1 ring-primary/20' : ''}`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <p className="text-sm font-medium leading-none">{task.content}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <Badge variant="outline" className={`text-xs ${
                                    task.priority === 'High' ? 'text-red-500 border-red-200 bg-red-50' : 
                                    task.priority === 'Medium' ? 'text-orange-500 border-orange-200 bg-orange-50' : 
                                    'text-blue-500 border-blue-200 bg-blue-50'
                                  }`}>
                                    {task.priority}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Icons.user className="h-3 w-3" />
                                    {task.assignee}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
