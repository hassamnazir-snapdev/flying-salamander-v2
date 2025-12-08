export interface Meeting {
  id: string;
  googleEventId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isOnline: boolean;
  location?: string;
  participants: string[];
  summaryLink?: string; // URL to Granola/Notion summary
  isRecorded?: boolean; // True if a summary/recording was found
  status: 'pending' | 'processed' | 'unrecorded' | 'offline-pending-input'; // Workflow status
}

export interface ActionItem {
  id: string;
  meetingId?: string;
  description: string;
  proposedActionType: 'Send Email' | 'Create Calendar Invite' | 'Assign Task' | 'Add Notes';
  status: 'Pending' | 'Confirmed' | 'Executed' | 'Rejected';
  owner?: string;
  dueDate?: Date;
  createdAt: Date;
  executedAt?: Date;
}