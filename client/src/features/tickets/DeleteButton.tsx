import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { deleteTicket } from "./ticketsSlice";
import { CloseIcon } from "../../components/icons";
import type { Ticket } from "../../types";

// Two-step inline confirm (no modal): first click arms, second click within 3s
// deletes; otherwise it disarms itself. Two visual variants for table vs. card.
export function DeleteButton({ ticket, variant }: { ticket: Ticket; variant: "icon" | "text" }) {
  const dispatch = useAppDispatch();
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleClick() {
    if (confirming) {
      clearTimeout(timer.current);
      dispatch(deleteTicket(ticket.id));
      return;
    }
    setConfirming(true);
    timer.current = setTimeout(() => setConfirming(false), 3000);
  }

  const label = confirming ? `Confirm delete of ${ticket.subject}` : `Delete ${ticket.subject}`;

  if (variant === "text") {
    return (
      <button className="tc-del" data-confirm={confirming} onClick={handleClick} aria-label={label}>
        {confirming ? "Confirm?" : "Delete"}
      </button>
    );
  }

  return (
    <button className="btn-icon" data-confirm={confirming} onClick={handleClick} aria-label={label}>
      {confirming ? "Confirm?" : <CloseIcon size={15} />}
    </button>
  );
}
