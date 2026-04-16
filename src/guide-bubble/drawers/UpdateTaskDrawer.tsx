import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TASK_STATUS_UPDATING,
  setStatusDrawerActive, emitStatusProceed, emitStatusCancel, emitTaskUnhighlight,
} from "../taskEvents";
import {
  TEXT, TEXT_SEC, TEXT_MUTED, BORDER, BG, DIAGRAM_BG, GRID, TABLE_BG, GREEN, MONO,
  Node, Arrow, browserIcon, serverIcon, databaseIcon,
} from "./shared";

// ── Steps ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "intro",
    title: "How does completing a task work?",
    desc: "Check off any task above and we'll walk you through exactly what happens under the hood.",
    activeNode: null as "browser" | "server" | "database" | null,
    activeArrow: null as "bs" | "sd" | null,
    returnAll: false,
    dbDone: false,
    waitForUpdate: true,
  },
  {
    id: "browser",
    title: "You checked off a task",
    desc: "React called your updateTaskStatus action. Your browser sent an HTTP POST request across the network to the server.",
    activeNode: "browser" as const,
    activeArrow: "bs" as const,
    returnAll: false,
    dbDone: false,
    waitForUpdate: false,
  },
  {
    id: "server",
    title: "Server received the request",
    desc: "Your Node.js server verified you're logged in, then started running the updateTaskStatus function.",
    activeNode: "server" as const,
    activeArrow: null,
    returnAll: false,
    dbDone: false,
    waitForUpdate: false,
  },
  {
    id: "server-to-db",
    title: "Server updates the database",
    desc: "The updateTaskStatus function tells PostgreSQL to UPDATE the row — the change is about to be written.",
    activeNode: null,
    activeArrow: "sd" as const,
    returnAll: false,
    dbDone: false,
    waitForUpdate: false,
  },
  {
    id: "database",
    title: "Row updated",
    desc: "PostgreSQL updated the row. isDone flipped to true:",
    activeNode: "database" as const,
    activeArrow: null,
    returnAll: false,
    dbDone: true,
    waitForUpdate: false,
  },
  {
    id: "return",
    title: "Response traveled back",
    desc: "The server confirmed success. React received the updated data and re-rendered — the task is now marked as done.",
    activeNode: "browser" as const,
    activeArrow: null,
    returnAll: true,
    dbDone: true,
    waitForUpdate: false,
  },
] as const;

// ── Mock DB table (always visible, isDone animates) ───────────────────────
function UpdateMockDbTable({
  taskId,
  description,
  isDone,
}: {
  taskId: string | null;
  description: string | null;
  isDone: boolean;
}) {
  const colStyle: React.CSSProperties = {
    padding: "4px 10px",
    borderRight: `1px solid ${BORDER}`,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 160,
  };
  const headerStyle: React.CSSProperties = {
    ...colStyle,
    fontWeight: 700,
    color: TEXT_MUTED,
    background: TABLE_BG,
    fontSize: 10,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };
  const cellStyle: React.CSSProperties = { ...colStyle, fontSize: 11, color: GREEN };

  return (
    <div style={{ fontFamily: MONO, border: `1px solid ${BORDER}`, borderRadius: 4, overflow: "hidden", background: TABLE_BG }}>
      <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "28%" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <th style={headerStyle}>id</th>
            <th style={headerStyle}>description</th>
            <th style={{ ...headerStyle, borderRight: "none" }}>isDone</th>
            <th style={{ ...headerStyle, borderRight: "none", fontSize: 9 }}>createdAt</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td style={{ ...cellStyle, color: TEXT_SEC }}>{taskId ? `${taskId.slice(0, 12)}…` : "—"}</td>
            <td style={{ ...cellStyle, color: TEXT_SEC }}>{description ?? "—"}</td>
            <td style={{ ...cellStyle, borderRight: "none", fontWeight: isDone ? 700 : 400, color: isDone ? GREEN : TEXT_SEC, overflow: "visible" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={isDone ? "true" : "false"}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "inline-block" }}
                >
                  {isDone ? "true" : "false"}
                </motion.span>
              </AnimatePresence>
            </td>
            <td style={{ ...cellStyle, color: TEXT_SEC, borderRight: "none", fontSize: 9 }}>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────
interface Props {
  onDismiss: () => void;
}

export function UpdateTaskDrawer({ onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const [taskInfo, setTaskInfo] = useState<{ taskId: string; description: string; isDone: boolean } | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;
  const drawerRef = useRef<HTMLDivElement>(null);
  const proceedFiredRef = useRef(false);

  useEffect(() => {
    setStatusDrawerActive(true);
    return () => {
      setStatusDrawerActive(false);
      if (!proceedFiredRef.current) emitStatusCancel();
      emitTaskUnhighlight();
    };
  }, []);

  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    const apply = () => { document.body.style.paddingBottom = `${el.offsetHeight}px`; };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => { ro.disconnect(); document.body.style.paddingBottom = ""; };
  }, []);

  useEffect(() => {
    function onUpdating(e: Event) {
      const { taskId, description, isDone } = (e as CustomEvent<{ taskId: string; description: string; isDone: boolean }>).detail;
      setTaskInfo({ taskId, description, isDone });
      if (stepRef.current === 0) setStep(1);
    }
    window.addEventListener(TASK_STATUS_UPDATING, onUpdating);
    return () => window.removeEventListener(TASK_STATUS_UPDATING, onUpdating);
  }, []);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const total   = STEPS.length;
  const padded  = String(step + 1).padStart(2, "0");

  // Dynamic title for browser step — depends on the actual isDone direction
  const stepTitle = current.id === "browser" && taskInfo
    ? (taskInfo.isDone ? "You checked off a task" : "You unchecked a task")
    : current.title;

  const bsActive      = current.activeArrow === "bs" || current.returnAll;
  const sdActive      = current.activeArrow === "sd" || current.returnAll;
  const browserActive = current.activeNode === "browser";
  const serverActive  = current.activeNode === "server";
  const dbActive      = current.activeNode === "database";

  const code = (s: string) => <code style={{ fontFamily: MONO, color: GREEN, fontSize: 12 }}>{s}</code>;
  const shortId = taskInfo ? taskInfo.taskId.slice(0, 12) + "…" : null;

  const stepDesc: React.ReactNode = (() => {
    if (!taskInfo) return current.desc;
    switch (current.id) {
      case "browser":      return <>React called your {code("updateTaskStatus")} action with the {code("ID")} and new status of the task. Your browser sent an HTTP POST request across the network to the server.</>;
      case "server":       return <>Your Node.js server verified you&apos;re logged in, then ran {code("updateTaskStatus")} with the {code("ID")} and new {code("isDone")} status.</>;
      case "server-to-db": return <>The {code("updateTaskStatus")} function tells PostgreSQL to {code("UPDATE")} the row — the change is about to be written.</>;
      case "database":     return <>PostgreSQL updated the row by finding the task {code("ID")} and flipping {code("isDone")} to {code(String(taskInfo.isDone))}.</>;
      case "return":       return <>The server confirmed success. React received the updated data and re-rendered — the task is now marked as {code(String(taskInfo.isDone))}.</>;
      default:             return current.desc;
    }
  })();

  return (
    <motion.div
      ref={drawerRef}
      layout
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 260 }}
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200000,
        background: BG, borderTop: `1px solid ${BORDER}`, borderRadius: "12px 12px 0 0",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.40)",
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
        color: TEXT, display: "flex", flexDirection: "column", maxHeight: "60vh", minHeight: 320,
      }}
    >
      {/* Drag handle */}
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER }} />
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 10px" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: TEXT_MUTED, margin: 0 }}>
            Behind the scenes
          </p>
          <AnimatePresence mode="wait">
            <motion.h2 key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
              style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "3px 0 0", letterSpacing: "-0.01em" }}>
              {stepTitle}
            </motion.h2>
          </AnimatePresence>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: TEXT, fontVariantNumeric: "tabular-nums" }}>{padded}</span>
            <span style={{ fontSize: 11, color: TEXT_MUTED, fontVariantNumeric: "tabular-nums" }}>/ {String(total).padStart(2, "0")}</span>
          </div>
          <button onClick={onDismiss} style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", fontSize: 20, padding: "0 2px", lineHeight: 1 }} aria-label="Close">×</button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Diagram */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 12px", borderRadius: 4, border: `1px solid ${BORDER}`,
          backgroundImage: `linear-gradient(to right, ${GRID} 1px, transparent 1px), linear-gradient(to bottom, ${GRID} 1px, transparent 1px)`,
          backgroundSize: "20px 20px", backgroundColor: DIAGRAM_BG, flexShrink: 0,
        }}>
          <Node icon={browserIcon}  label="Browser"  sublabel="React"      active={browserActive} isReturn={current.returnAll} animationType="browser" />
          <Arrow active={bsActive}  reverse={current.returnAll} />
          <Node icon={serverIcon}   label="Server"   sublabel="Node.js"    active={serverActive}  isReturn={false} animationType="server" spinIcon={current.returnAll} />
          <Arrow active={sdActive}  reverse={current.returnAll} />
          <Node icon={databaseIcon} label="Database" sublabel="PostgreSQL" active={dbActive}       isReturn={false} animationType="database" />
        </div>

        {/* Mock DB table — visible once task info is known */}
        {taskInfo && (
          <UpdateMockDbTable
            taskId={taskInfo.taskId}
            description={taskInfo.description}
            isDone={current.dbDone ? taskInfo.isDone : !taskInfo.isDone}
          />
        )}

        {/* Step description */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.6, margin: 0, minHeight: "3.2em" }}>{stepDesc}</p>

            {current.waitForUpdate && (
              <div style={{ fontFamily: MONO, fontSize: 11, color: GREEN, display: "flex", alignItems: "center" }}>
                <span>$ waiting for task checkbox</span>
                <motion.span animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear", times: [0, 0.49, 0.5, 1] }}
                  style={{ display: "inline-block", width: 7, height: 13, background: GREEN, marginLeft: 3, verticalAlign: "middle" }} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!current.waitForUpdate && (
        <div style={{ padding: "10px 20px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setStep((s) => s - 1)} style={{
            background: "none", color: TEXT_SEC, border: `1px solid ${BORDER}`, borderRadius: 5,
            padding: "7px 14px", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em",
            cursor: step >= 2 ? "pointer" : "default", visibility: step >= 2 ? "visible" : "hidden",
          }}>← Back</button>

          <button onClick={() => {
            if (step === 4 && !proceedFiredRef.current) { emitStatusProceed(); proceedFiredRef.current = true; }
            if (isLast) onDismiss(); else setStep((s) => s + 1);
          }} style={{
            background: TEXT, color: BG, border: "none", borderRadius: 5,
            padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em",
          }}>{isLast ? "Done" : "Next →"}</button>
        </div>
      )}
    </motion.div>
  );
}
