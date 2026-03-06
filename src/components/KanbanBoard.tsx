import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { COLUMNS, TaskStatus } from '@/types/task';
import KanbanColumn from './KanbanColumn';
import { useTaskStore } from '@/hooks/useTaskStore';

interface KanbanBoardProps {
  taskStore: ReturnType<typeof useTaskStore>;
}

export default function KanbanBoard({ taskStore }: KanbanBoardProps) {
  const { getTasksByStatus, updateTaskStatus, deleteTask } = taskStore;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const isColumn = COLUMNS.some((c) => c.id === overId);
    if (isColumn) {
      updateTaskStatus(taskId, overId as TaskStatus);
      return;
    }

    // Dropped on another task — find that task's status
    const overTask = taskStore.tasks.find((t) => t.id === overId);
    if (overTask) {
      updateTaskStatus(taskId, overTask.status);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={getTasksByStatus(col.id)}
            onDeleteTask={deleteTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
