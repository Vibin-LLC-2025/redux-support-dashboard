export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  id: number;
  subject: string;
  requester: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewTicketInput {
  subject: string;
  requester: string;
  priority: TicketPriority;
  assignee?: string;
}

export type TicketPatch = Partial<Pick<Ticket, "status" | "priority" | "assignee">>;
