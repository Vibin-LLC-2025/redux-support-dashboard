import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createTicket, selectTicketsStatus } from "./ticketsSlice";
import type { TicketPriority } from "../../types";

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export function NewTicketForm() {
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
      // unwrap() rethrows the thunk's rejection so the form can show it.
      await dispatch(createTicket({ subject, requester, priority })).unwrap();
      setSubject("");
      setRequester("");
      setPriority("medium");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="new-ticket" onSubmit={handleSubmit}>
      <h2>New ticket</h2>
      <input
        placeholder="Subject (min 3 chars)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        aria-label="Subject"
      />
      <input
        placeholder="Requester"
        value={requester}
        onChange={(e) => setRequester(e.target.value)}
        aria-label="Requester"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as TicketPriority)}
        aria-label="Priority"
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button type="submit" className="btn-primary" disabled={submitting || status === "loading"}>
        {submitting ? "Adding…" : "Add ticket"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
