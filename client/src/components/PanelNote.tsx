import { useAppSelector } from "../app/hooks";
import { selectNotesVisible } from "../features/ui/uiSlice";
import { InfoIcon } from "./icons";

// Build note pinned under a panel heading: names the Redux Toolkit API that
// powers the panel, then says in plain words what it does. Hidden entirely when
// the notes toggle is off — not just visually, so it leaves the a11y tree too.
export function PanelNote({ api, children }: { api: string; children: React.ReactNode }) {
  const visible = useAppSelector(selectNotesVisible);
  if (!visible) return null;

  return (
    <p className="panel-note">
      <InfoIcon className="panel-note-icon" />
      <span>
        <code className="panel-note-api">{api}</code> — {children}
      </span>
    </p>
  );
}
