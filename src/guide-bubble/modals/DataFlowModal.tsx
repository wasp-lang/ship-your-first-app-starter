import { useState, useEffect, type ReactNode } from "react";
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
  icon: ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  isReturn?: boolean;
  animationType?: "server" | "database" | "browser";
  spinIcon?: boolean;
}) {
  const [iconPhase, setIconPhase] = useState<"main" | "overlay1" | "overlay2">("main");
  const [showRerender, setShowRerender] = useState(false);
  const [spinActive, setSpinActive] = useState(false);

  useEffect(() => {
    setIconPhase("main");
    setShowRerender(false);

    if (active && isReturn && animationType === "browser") {
      const t = setTimeout(() => setShowRerender(true), 600);
      return () => clearTimeout(t);
    }
    if (!active || isReturn || !animationType) return;
    if (animationType === "browser") return;

    // server: cog → checkmark (skip lock)
    // database: cylinder → table cells (no further transition)
    const t1 = setTimeout(() => {
      if (animationType === "server") setIconPhase("overlay2");
      else if (animationType === "database") setIconPhase("overlay1");
    }, 800);
    return () => clearTimeout(t1);
  }, [active, isReturn, animationType]);

  // spinIcon is true during the return step — spin until the sparkle settles (~950ms)
  useEffect(() => {
    if (!spinIcon) { setSpinActive(false); return; }
    setSpinActive(true);
    const t = setTimeout(() => setSpinActive(false), 950);
    return () => clearTimeout(t);
  }, [spinIcon]);

  const isAnimating = active && !isReturn && !!animationType;
  // only spin while the main icon is showing (stops when checkmark rotates in)
  const shouldSpin  = (isAnimating && animationType === "server" && iconPhase === "main") || spinActive;
  const shouldPulse = isAnimating && animationType === "database" && iconPhase === "main";

  const iconAnimate = shouldSpin
    ? { rotate: 360 }
    : shouldPulse
    ? { scale: [1, 1.18, 1] }
    : {};
  const iconTransition = shouldSpin
    ? { duration: 0.9, repeat: Infinity, ease: "linear" as const }
    : shouldPulse
    ? { duration: 0.85, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 0.3 };

  const overlay1Emoji = animationType === "server" ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="36" height="36">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="36" height="36">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
    </svg>
  );
  const overlay2Icon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="36" height="36">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
  const displayIcon = iconPhase === "overlay1" ? overlay1Emoji
    : iconPhase === "overlay2" ? overlay2Icon
    : icon;

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
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        minWidth: 100,
        flexShrink: 0,
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
      }}
    >

      {/* Icon area — extra top space so the sparkle can float above without clipping */}
      <div
        style={{
          position: "relative",
          width: 48,
          height: 72,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 6,
        }}
      >
        {/* Sparkle — floats above the icon, never overlaps */}
        <AnimatePresence>
          {showRerender && (
            <motion.span
              initial={{ y: 6, opacity: 0 }}
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
                pointerEvents: "none",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Cycling icon — clockwise carousel: exits top-right, enters bottom-left */}
        <motion.div
          animate={iconAnimate}
          transition={iconTransition}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={iconPhase}
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {displayIcon}
            </motion.div>
          </AnimatePresence>
        </motion.div>
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
          <Node icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>} label="Browser" sublabel="React"       active={browserActive} isReturn={current.returnAll} animationType="browser" />
          <Arrow active={bsActive} reverse={current.returnAll} />
          <Node icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>} label="Server"  sublabel="Node.js"     active={serverActive}  isReturn={false}            animationType="server"  spinIcon={current.returnAll} />
          <Arrow active={sdActive} reverse={current.returnAll} />
          <Node icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>} label="Database" sublabel="PostgreSQL" active={dbActive}       isReturn={false}            animationType="database" />
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
