import { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";

// Accessible slide-over: focus moves in on open, Tab is trapped, Escape closes,
// and focus returns to the trigger on close. Becomes a bottom sheet on mobile
// (CSS). Backdrop click closes.
export function SlideOver({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const getFocusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    // Prefer the first form field; fall back to the first focusable (close btn).
    const firstField = panelRef.current?.querySelector<HTMLElement>("input, select, textarea");
    (firstField ?? getFocusables()[0])?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prevFocus?.focus();
    };
  }, [onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="slideover" role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        <div className="slideover-head">
          <h2>{title}</h2>
          <button className="btn-icon slideover-close" onClick={onClose} aria-label="Close panel">
            <CloseIcon />
          </button>
        </div>
        <div className="slideover-body">{children}</div>
      </div>
    </>
  );
}
