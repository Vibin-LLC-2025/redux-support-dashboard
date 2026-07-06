import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createTicket, selectTicketsStatus } from "./ticketsSlice";
import { AlertIcon } from "../../components/icons";
import type { TicketPriority } from "../../types";

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export function NewTicketForm({ onCreated }: { onCreated?: () => void }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectTicketsStatus);
  const [subject, setSubject] = useState("");
  const [requester, setRequester] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // unwrap() rethrows the thunk's rejection so the form can surface it.
      await dispatch(createTicket({ subject, requester, priority })).unwrap();
      setSubject("");
      setRequester("");
      setPriority("medium");
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="new-ticket" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="nt-subject">Subject</label>
        <input
          id="nt-subject"
          placeholder="Short summary of the issue"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <span className="field-hint">Minimum 3 characters.</span>
      </div>

      <div className="field">
        <label htmlFor="nt-requester">Requester</label>
        <input
          id="nt-requester"
          placeholder="Who reported it"
          value={requester}
          onChange={(e) => setRequester(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="nt-priority">Priority</label>
        <select
          id="nt-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
          style={{ textTransform: "capitalize" }}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="form-error" role="alert">
          <AlertIcon size={16} />
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting || status === "loading"}>
        {submitting ? "Adding…" : "Add ticket"}
      </button>
    </form>
  );
}
