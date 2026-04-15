import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Monochromatic palette ──────────────────────────────────────────────────
const TEXT        = "#111111";
const TEXT_SEC    = "#555555";
const TEXT_MUTED  = "#aaaaaa";
const BORDER      = "#d8d8d0";       // inactive node / arrow
const ACTIVE      = "#111111";       // forward active
const RETURN      = "#666666";       // return path
const TRACK       = "#ebebE4";       // arrow track when active
const MODAL_BG    = "#ffffff";
const DIAGRAM_BG  = "#fafaf8";
const GRID        = "#e6e6de";       // graph paper lines

const STEPS = [
  {
    activeNode: "browser",
    activeArrow: "bs" as "bs" | "sd" | null,
    returnAll: false,
    title: 'You clicked "Add Task"',
    desc: "React — the frontend — detected your click and called an action function to handle it.",
  },
  {
    activeNode: null,
    activeArrow: "bs" as "bs" | "sd" | null,
    returnAll: false,
    title: "Browser sends a request",
    desc: "Your browser sent an HTTP request across the network to your server running locally.",
  },
  {
    activeNode: "server",
    activeArrow: null as "bs" | "sd" | null,
    returnAll: false,
    title: "Server processes the request",
    desc: "The server verified you're logged in, then ran your addTask action function.",
  },
  {
    activeNode: null,
    activeArrow: "sd" as "bs" | "sd" | null,
    returnAll: false,
    title: "Server writes to the database",
    desc: "The server's addTask function instructs the database to add the data in a new row.",
  },
  {
    activeNode: "database",
    activeArrow: null as "bs" | "sd" | null,
    returnAll: false,
    title: "Task saved",
    desc: "The database stored the new row — this is why your data persists after a page refresh.",
  },
  {
    activeNode: "browser",
    activeArrow: null as "bs" | "sd" | null,
    returnAll: true,
    title: "Response travels back",
    desc: "The server confirmed success. React received the updated list and re-rendered your screen.",
  },
] as const;

// ── Node ──────────────────────────────────────────────────────────────────
function Node({
  icon,
  label,
  sublabel,
  active,
  isReturn,
  animationType,
  spinIcon,
}: {
  icon: string;
  label: string;
  sublabel: string;
  active: boolean;
  isReturn?: boolean;
  animationType?: "server" | "database" | "browser";
  spinIcon?: boolean;
}) {
  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);
  const [showRerender, setShowRerender] = useState(false);

  useEffect(() => {
    setShowOverlay1(false);
    setShowOverlay2(false);
    setShowRerender(false);

    if (active && isReturn && animationType === "browser") {
      const t = setTimeout(() => setShowRerender(true), 600);
      return () => clearTimeout(t);
    }
    if (!active || isReturn || !animationType) return;
    if (animationType === "browser") return;

    const t1 = setTimeout(() => setShowOverlay1(true), 600);
    const t2 = setTimeout(() => setShowOverlay2(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active, isReturn, animationType]);

  const isAnimating = active && !isReturn && !!animationType;
  const shouldSpin  = (isAnimating && animationType === "server") || !!spinIcon;

  const iconAnimate = shouldSpin
    ? { rotate: 360 }
    : isAnimating && animationType === "database"
    ? { scale: [1, 1.18, 1] }
    : {};
  const iconTransition = shouldSpin
    ? { duration: 0.9, repeat: Infinity, ease: "linear" as const }
    : isAnimating && animationType === "database"
    ? { duration: 0.85, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 0.3 };

  const overlay1Emoji = animationType === "server" ? "🔒" : "📥";
  const activeColor = isReturn ? RETURN : ACTIVE;
  const fadedColor  = isReturn ? "rgba(102,102,102,0.15)" : "rgba(17,17,17,0.15)";

  return (
    <motion.div
      animate={{
        borderColor: active ? [activeColor, fadedColor] : BORDER,
        backgroundColor: MODAL_BG,
      }}
      transition={
        active
          ? { borderColor: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }, backgroundColor: { duration: 0.3 } }
          : { duration: 0.3 }
      }
      style={{
        position: "relative",
        border: "1.5px solid",
        borderRadius: 8,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        minWidth: 100,
        flexShrink: 0,
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
      }}
    >

      {/* Icon area */}
      <div
        style={{
          position: "relative",
          width: 40,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Re-render sparkle — fades in from above on return step */}
        <AnimatePresence>
          {showRerender && (
            <motion.span
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 0,
                left: 0, right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                pointerEvents: "none",
              }}
            >
              ✨
            </motion.span>
          )}
        </AnimatePresence>

        {/* Main icon */}
        <motion.span
          animate={iconAnimate}
          transition={iconTransition}
          style={{ fontSize: 30, display: "block", lineHeight: 1 }}
        >
          {icon}
        </motion.span>

        {/* Overlay 1: 🔒 / 📥 */}
        <AnimatePresence>
          {showOverlay1 && (
            <motion.span
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, pointerEvents: "none",
              }}
            >
              {overlay1Emoji}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Overlay 2: ✅ */}
        <AnimatePresence>
          {showOverlay2 && animationType !== "browser" && (
            <motion.span
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, pointerEvents: "none",
              }}
            >
              ✅
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Label — uppercase, letter-spaced */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: active ? TEXT : TEXT_SEC,
          transition: "color 0.3s",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 10, color: active ? TEXT_SEC : TEXT_MUTED, transition: "color 0.3s" }}>
        {sublabel}
      </span>
    </motion.div>
  );
}

// ── Arrow ─────────────────────────────────────────────────────────────────
function Arrow({ active, reverse = false }: { active: boolean; reverse?: boolean }) {
  const color = active ? (reverse ? RETURN : ACTIVE) : BORDER;
  const x1 = reverse ? 66 : 8;
  const x2 = reverse ? 10 : 64;

  return (
    <div style={{ width: 76, height: 32, position: "relative", display: "flex", alignItems: "center", flexShrink: 0 }}>
      <svg width="76" height="32" viewBox="0 0 76 32" style={{ overflow: "visible" }}>
        {/* Track */}
        <motion.line
          x1={x1} y1="16" x2={x2} y2="16"
          animate={{ stroke: active ? TRACK : BORDER }}
          transition={{ duration: 0.3 }}
          strokeWidth="2" strokeLinecap="round"
        />
        {/* Arrowhead */}
        <motion.polygon
          points={reverse ? "8,16 18,11 18,21" : "66,16 56,11 56,21"}
          animate={{ fill: color }}
          transition={{ duration: 0.3 }}
        />
        {/* Traveling dashes */}
        <AnimatePresence>
          {active && (
            <motion.line
              key="dashes"
              x1={x1} y1="16" x2={x2} y2="16"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="5 5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, strokeDashoffset: [0, -10] }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                strokeDashoffset: { duration: 0.4, repeat: Infinity, ease: "linear" },
              }}
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
interface Props {
  onDismiss: () => void;
}

export function DataFlowModal({ onDismiss }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const total   = STEPS.length;

  const bsActive     = current.activeArrow === "bs" || current.returnAll;
  const sdActive     = current.activeArrow === "sd" || current.returnAll;
  const browserActive = current.activeNode === "browser";
  const serverActive  = current.activeNode === "server";
  const dbActive      = current.activeNode === "database";

  const padded = String(step + 1).padStart(2, "0");

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          background: MODAL_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: "1.75rem",
          maxWidth: 600,
          width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
          fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
          color: TEXT,
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: TEXT_MUTED, marginBottom: 5 }}>
              Behind the scenes
            </p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: "-0.01em" }}>
              What happened when you added a task?
            </h2>
          </div>

          {/* Step counter + close */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0, marginLeft: 16 }}>
            <button
              onClick={onDismiss}
              style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: TEXT, fontVariantNumeric: "tabular-nums" }}>{padded}</span>
              <span style={{ fontSize: 12, color: TEXT_MUTED, fontVariantNumeric: "tabular-nums" }}>/ {String(total).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* ── Diagram (graph paper) ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
            padding: "2.5rem 2rem",
            borderRadius: 4,
            border: `1px solid ${BORDER}`,
            backgroundImage: `
              linear-gradient(to right, ${GRID} 1px, transparent 1px),
              linear-gradient(to bottom, ${GRID} 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
            backgroundColor: DIAGRAM_BG,
            overflow: "visible",
          }}
        >
          <Node icon="🖥️" label="Browser" sublabel="React"       active={browserActive} isReturn={current.returnAll} animationType="browser" />
          <Arrow active={bsActive} reverse={current.returnAll} />
          <Node icon="⚙️" label="Server"  sublabel="Node.js"     active={serverActive}  isReturn={false}            animationType="server"  spinIcon={current.returnAll} />
          <Arrow active={sdActive} reverse={current.returnAll} />
          <Node icon="💾" label="Database" sublabel="PostgreSQL" active={dbActive}       isReturn={false}            animationType="database" />
        </div>

        {/* ── Step content ── */}
        <div style={{ minHeight: 68, marginBottom: "1.5rem" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.16 }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 5px", letterSpacing: "-0.01em" }}>
                {current.title}
              </p>
              <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0, lineHeight: 1.6 }}>
                {current.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: i === step ? TEXT : i < step ? TEXT_MUTED : BORDER,
                  width: i === step ? 18 : 6,
                }}
                transition={{ duration: 0.2 }}
                style={{ height: 6, borderRadius: 3 }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{
                  background: "none",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 3,
                  color: TEXT_SEC,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "7px 16px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? onDismiss : () => setStep((s) => s + 1)}
              style={{
                background: TEXT,
                border: `1px solid ${TEXT}`,
                borderRadius: 3,
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                padding: "7px 18px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {isLast ? "Got it!" : "Next →"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
