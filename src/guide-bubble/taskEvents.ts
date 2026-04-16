export const TASK_SUBMITTING  = "task:submitting";
export const TASK_SAVED      = "task:saved";
export const TASK_PROCEED    = "task:proceed";     // drawer → form: now call createTask
export const TASK_CANCEL     = "task:cancel";      // drawer dismissed before proceed
export const TASK_UNHIGHLIGHT = "task:unhighlight"; // drawer closed — clear highlight

let _drawerActive = false;
export function setDrawerActive(active: boolean) {
  _drawerActive = active;
  if (!active) _lastSavedTaskId = null;
}

// Set when TASK_SAVED fires so TaskListItem can highlight on mount
let _lastSavedTaskId: string | null = null;
export function getLastSavedTaskId() { return _lastSavedTaskId; }

export function emitTaskSubmitting(description: string) {
  window.dispatchEvent(new CustomEvent(TASK_SUBMITTING, { detail: { description } }));
}

export function emitTaskSaved(taskId: string, description: string) {
  if (!_drawerActive) return;  // only highlight during the data-flow interactive step
  _lastSavedTaskId = taskId;
  window.dispatchEvent(new CustomEvent(TASK_SAVED, { detail: { taskId, description } }));
}

export function emitTaskProceed() {
  window.dispatchEvent(new CustomEvent(TASK_PROCEED));
}

export function emitTaskCancel() {
  window.dispatchEvent(new CustomEvent(TASK_CANCEL));
}

export function emitTaskUnhighlight() {
  window.dispatchEvent(new CustomEvent(TASK_UNHIGHLIGHT));
}

/** Resolves immediately if no drawer is active. Otherwise waits for the drawer
 *  to reach the final step (proceed), or rejects with "cancelled" if dismissed. */
export function waitForDrawerProceed(): Promise<void> {
  if (!_drawerActive) return Promise.resolve();
  return new Promise((resolve, reject) => {
    function onProceed() { cleanup(); resolve(); }
    function onCancel()  { cleanup(); reject(new Error("cancelled")); }
    function cleanup() {
      window.removeEventListener(TASK_PROCEED, onProceed);
      window.removeEventListener(TASK_CANCEL,  onCancel);
    }
    window.addEventListener(TASK_PROCEED, onProceed);
    window.addEventListener(TASK_CANCEL,  onCancel);
  });
}

// ── Update-task drawer events ─────────────────────────────────────────────
export const TASK_STATUS_UPDATING = "task:status:updating";
export const TASK_STATUS_PROCEED  = "task:status:proceed";
export const TASK_STATUS_CANCEL   = "task:status:cancel";

let _statusDrawerActive = false;
export function setStatusDrawerActive(active: boolean) { _statusDrawerActive = active; }

export function emitTaskStatusUpdating(taskId: string, description: string, isDone: boolean) {
  window.dispatchEvent(new CustomEvent(TASK_STATUS_UPDATING, { detail: { taskId, description, isDone } }));
}

export function emitStatusProceed() {
  window.dispatchEvent(new CustomEvent(TASK_STATUS_PROCEED));
}

export function emitStatusCancel() {
  window.dispatchEvent(new CustomEvent(TASK_STATUS_CANCEL));
}

export function waitForStatusDrawerProceed(): Promise<void> {
  if (!_statusDrawerActive) return Promise.resolve();
  return new Promise((resolve, reject) => {
    function onProceed() { cleanup(); resolve(); }
    function onCancel()  { cleanup(); reject(new Error("cancelled")); }
    function cleanup() {
      window.removeEventListener(TASK_STATUS_PROCEED, onProceed);
      window.removeEventListener(TASK_STATUS_CANCEL,  onCancel);
    }
    window.addEventListener(TASK_STATUS_PROCEED, onProceed);
    window.addEventListener(TASK_STATUS_CANCEL,  onCancel);
  });
}
