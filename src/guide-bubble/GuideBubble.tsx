import { useState, useEffect, useRef } from "react";
import { useCourseProgress, getGuideMessage } from "./useGuideState";

const TOTAL_BEATS = 4;

export function GuideBubble() {
  const progress = useCourseProgress();
  const message = getGuideMessage(progress);
  const activeStep = progress?.guideStep ?? null;

  const dismissedStep = sessionStorage.getItem("guide-dismissed-step");
  const guideHidden = dismissedStep != null && Number(dismissedStep) === activeStep;

  const setGuideHidden = (hidden: boolean) => {
    if (hidden && activeStep != null) {
      sessionStorage.setItem("guide-dismissed-step", String(activeStep));
    } else {
      sessionStorage.removeItem("guide-dismissed-step");
    }
    // Force re-render by dispatching a storage event won't work same-tab,
    // so we use a dummy state to trigger it
    setRenderTick((t) => t + 1);
  };

  const [, setRenderTick] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const menuTimeoutRef = useRef<number>(0);

  const handleMenuEnter = () => {
    window.clearTimeout(menuTimeoutRef.current);
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = window.setTimeout(() => setMenuOpen(false), 300);
  };

  const shareUrl = (baseUrl: string) => {
    const text = progress
      ? progress.status === "complete"
        ? `I just completed Module ${progress.module} of Ship Your First App! 🚀`
        : `I'm on Beat ${progress.beat}/${TOTAL_BEATS} of Module ${progress.module} in Ship Your First App — ${progress.title} 🐝`
      : "I'm learning to build web apps with Ship Your First App! 🐝";
    return baseUrl + encodeURIComponent(text);
  };

  const hasMessage = !!message;
  const showBubble = hasMessage && !guideHidden;

  return (
    <>
      <style>{`
        /* ── Bee button ── */
        .guide-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 100000;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #89b4fa;
          background: #1e1e2e;
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          padding: 0;
        }
        .guide-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(0,0,0,0.4);
        }
        .guide-fab-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(137, 180, 250, 0.4);
          animation: guide-fab-pulse 2s ease-in-out infinite;
        }
        @keyframes guide-fab-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.3); }
        }

        /* ── Hover menu ── */
        .guide-menu {
          position: fixed;
          bottom: 76px;
          right: 20px;
          z-index: 100000;
          width: 240px;
          background: #1e1e2e;
          border: 1px solid #313244;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #cdd6f4;
          opacity: 0;
          transform: translateY(8px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .guide-menu-open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .guide-menu-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6c7086;
          margin-bottom: 8px;
        }

        /* ── Progress section ── */
        .guide-progress {
          margin-bottom: 12px;
        }
        .guide-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .guide-progress-module {
          font-size: 13px;
          font-weight: 600;
          color: #cdd6f4;
        }
        .guide-progress-beat {
          font-size: 11px;
          color: #a6adc8;
        }
        .guide-progress-bar-track {
          width: 100%;
          height: 6px;
          background: #313244;
          border-radius: 3px;
          overflow: hidden;
        }
        .guide-progress-bar-fill {
          height: 100%;
          background: #89b4fa;
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .guide-progress-bar-fill-complete {
          background: #a6e3a1;
        }
        .guide-progress-title {
          font-size: 11px;
          color: #a6adc8;
          margin-top: 4px;
        }
        .guide-progress-empty {
          font-size: 12px;
          color: #6c7086;
          font-style: italic;
        }

        /* ── Menu buttons ── */
        .guide-menu-divider {
          height: 1px;
          background: #313244;
          margin: 8px 0;
        }
        .guide-toggle-btn {
          width: 100%;
          padding: 4px 8px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #cdd6f4;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s ease;
        }
        .guide-toggle-btn:hover {
          background: rgba(255,255,255,0.05);
        }
        .guide-toggle-btn:disabled {
          color: #45475a;
          cursor: default;
        }
        .guide-toggle-btn:disabled:hover {
          background: none;
        }
        .guide-toggle-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        /* ── Share links ── */
        .guide-share-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 4px;
          padding-left: 28px;
        }
        .guide-share-link {
          font-size: 12px;
          color: #a6adc8;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .guide-share-link:hover {
          background: rgba(255,255,255,0.05);
          color: #cdd6f4;
        }

        /* ── Guide bubble (top center) ── */
        .guide-bubble {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          max-width: 480px;
          width: calc(100% - 32px);
          padding: 12px 20px;
          background: #1e1e2e;
          color: #cdd6f4;
          border: 2px solid #89b4fa;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 1.5;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(137,180,250,0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .guide-bubble-enter {
          opacity: 0;
          transform: translateX(-50%) translateY(-8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .guide-bubble-visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .guide-bubble-avatar {
          font-size: 22px;
          flex-shrink: 0;
        }
        .guide-bubble-message {
          margin: 0;
          flex: 1;
        }
        .guide-bubble-dismiss {
          background: none;
          border: none;
          color: #6c7086;
          cursor: pointer;
          font-size: 16px;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .guide-bubble-dismiss:hover {
          color: #cdd6f4;
          background: rgba(255,255,255,0.05);
        }
      `}</style>

      {/* ── Floating bee button ── */}
      <div
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleMenuLeave}
      >
        <button className="guide-fab" aria-label="Course guide">
          🐝
          {hasMessage && guideHidden && <span className="guide-fab-ring" />}
        </button>

        {/* ── Hover menu ── */}
        <div className={`guide-menu ${menuOpen ? "guide-menu-open" : ""}`}>
          <div className="guide-menu-label">Course Progress</div>

          {progress ? (
            <div className="guide-progress">
              <div className="guide-progress-header">
                <span className="guide-progress-module">Module {progress.module}</span>
                <span className="guide-progress-beat">
                  {progress.status === "complete"
                    ? "Complete!"
                    : `Beat ${progress.beat} / ${TOTAL_BEATS}`}
                </span>
              </div>
              <div className="guide-progress-bar-track">
                <div
                  className={`guide-progress-bar-fill ${progress.status === "complete" ? "guide-progress-bar-fill-complete" : ""}`}
                  style={{
                    width: `${progress.status === "complete" ? 100 : (progress.beat / TOTAL_BEATS) * 100}%`,
                  }}
                />
              </div>
              <div className="guide-progress-title">{progress.title}</div>
            </div>
          ) : (
            <div className="guide-progress">
              <span className="guide-progress-empty">No module started yet</span>
            </div>
          )}

          <div className="guide-menu-divider" />

          <label
            className="guide-toggle-btn"
            style={{ cursor: hasMessage ? "pointer" : "default" }}
          >
            <input
              type="checkbox"
              checked={hasMessage && !guideHidden}
              disabled={!hasMessage}
              onChange={(e) => setGuideHidden(!e.target.checked)}  
              style={{ accentColor: "#89b4fa" }}
            />
            {hasMessage ? "Show guide" : "No guide message"}
          </label>

          <div className="guide-menu-divider" />

          <button
            className="guide-toggle-btn"
            onClick={() => setShareOpen((s) => !s)}
          >
            <span className="guide-toggle-icon">📣</span>
            Share your progress
          </button>
          {shareOpen && (
            <div className="guide-share-links">
              <a
                href={shareUrl("https://x.com/intent/tweet?text=")}
                target="_blank"
                rel="noopener noreferrer"
                className="guide-share-link"
                onClick={() => setShareOpen(false)}
              >
                𝕏 Twitter / X
              </a>
              <a
                href={shareUrl("https://bsky.app/intent/compose?text=")}
                target="_blank"
                rel="noopener noreferrer"
                className="guide-share-link"
                onClick={() => setShareOpen(false)}
              >
                🦋 Bluesky
              </a>
              <a
                href={shareUrl("https://www.linkedin.com/sharing/share-offsite/?url=&summary=")}
                target="_blank"
                rel="noopener noreferrer"
                className="guide-share-link"
                onClick={() => setShareOpen(false)}
              >
                💼 LinkedIn
              </a>
              <a
                href={shareUrl("https://www.facebook.com/sharer/sharer.php?quote=")}
                target="_blank"
                rel="noopener noreferrer"
                className="guide-share-link"
                onClick={() => setShareOpen(false)}
              >
                📘 Facebook
              </a>
            </div>
          )}

          <div className="guide-menu-divider" />

          <a
            href="https://discord.gg/rzdnErX"
            target="_blank"
            rel="noopener noreferrer"
            className="guide-toggle-btn"
            style={{ textDecoration: "none" }}
          >
            <span className="guide-toggle-icon">💬</span>
            Get 1:1 help
          </a>

          <a
            href="https://forms.gle/3U5wKpc3ZeEWJvaq7"
            target="_blank"
            rel="noopener noreferrer"
            className="guide-toggle-btn"
            style={{ textDecoration: "none" }}
          >
            <span className="guide-toggle-icon">📝</span>
            Give feedback
          </a>
        </div>
      </div>

      {/* ── Guide bubble (top center) ── */}
      {showBubble && (
        <div className="guide-bubble guide-bubble-visible">
          <span className="guide-bubble-avatar">🐝</span>
          <p className="guide-bubble-message">{message}</p>
          <button
            className="guide-bubble-dismiss"
            onClick={() => setGuideHidden(true)}
            aria-label="Dismiss guide bubble"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
