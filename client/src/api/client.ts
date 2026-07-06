import type { NewTicketInput, Ticket, TicketPatch } from "../types";

// Thin fetch wrapper. Throws on non-2xx so async thunks land in `rejected`
// with a useful message.
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.error || body.errors?.join(", ") || `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const ticketsApi = {
  list: () => request<Ticket[]>("/api/tickets"),
  create: (input: NewTicketInput) =>
    request<Ticket>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: number, patch: TicketPatch) =>
    request<Ticket>(`/api/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  remove: (id: number) =>
    request<void>(`/api/tickets/${id}`, { method: "DELETE" }),
};
