import { ChangeEvent, useState, useEffect } from "react";
import { twJoin } from "tailwind-merge";
import { updateTaskStatus } from "wasp/client/operations";
import { TagLabel } from "../../tags/components/TagLabel";
import { TaskWithTags } from "../queries";
import {
  TASK_SAVED, TASK_UNHIGHLIGHT, getLastSavedTaskId,
  emitTaskStatusUpdating, waitForStatusDrawerProceed,
} from "../../guide-bubble/taskEvents";

interface TaskListItemProps {
  task: TaskWithTags;
}

export function TaskListItem({ task }: TaskListItemProps) {
  const [highlighted, setHighlighted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Clears the highlight: waits for drawer close, or falls back to 3s if no drawer
    function startHighlight() {
      setHighlighted(true);
      // Safety fallback — clears after 30s even if unhighlight event never fires
      const fallback = setTimeout(() => setHighlighted(false), 30_000);
      function onUnhighlight() {
        clearTimeout(fallback);
        setHighlighted(false);
        window.removeEventListener(TASK_UNHIGHLIGHT, onUnhighlight);
      }
      window.addEventListener(TASK_UNHIGHLIGHT, onUnhighlight);
      return () => {
        clearTimeout(fallback);
        window.removeEventListener(TASK_UNHIGHLIGHT, onUnhighlight);
      };
    }

    // Handle the case where task:saved already fired before this item mounted
    if (task.id === getLastSavedTaskId()) {
      return startHighlight();
    }

    function onSaved(e: Event) {
      const { taskId } = (e as CustomEvent<{ taskId: string }>).detail;
      if (taskId === task.id) startHighlight();
    }
    window.addEventListener(TASK_SAVED, onSaved);
    return () => window.removeEventListener(TASK_SAVED, onSaved);
  }, [task.id]);

  async function setTaskDone(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const isDone = event.currentTarget.checked;
    emitTaskStatusUpdating(task.id, task.description, isDone);
    setIsUpdating(true);
    try {
      await waitForStatusDrawerProceed();
      await updateTaskStatus({ id: task.id, isDone });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "cancelled") return;
      window.alert(`Error while updating task: ${String(err)}`);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <li>
      <label
        className={twJoin(
          "flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3 transition-colors duration-200",
          task.isDone ? "bg-primary-50" : "hover:bg-neutral-50",
          highlighted ? "ring-2 ring-inset ring-primary-400" : "",
        )}
      >
        <div className="flex min-w-0 items-center gap-4">
          {isUpdating ? (
            <svg className="h-5 w-5 shrink-0 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <input
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-primary-500"
              checked={task.isDone}
              onChange={setTaskDone}
            />
          )}
          <div className="flex min-w-0 flex-col wrap-break-word">
            <p>{task.description}</p>
            <span className="text-xs text-neutral-500">
              {task.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ul className="flex flex-wrap gap-x-2">
            {task.tags.map((tag) => (
              <li key={tag.id}>
                <TagLabel tag={tag} isActive={true} size="tiny" />
              </li>
            ))}
          </ul>
          <span className="shrink-0 text-neutral-300 text-sm">→</span>
        </div>
      </label>
    </li>
  );
}
