// models.ts - All TypeScript interfaces and models

export interface User {
  _id?: string;
  username: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Judge' | 'Lawyer' | 'Court Staff';
  firstName: string;
  lastName: string;
  contactNumber: string;
  isActive?: boolean;
  lastLogin?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface Case {
  _id?: string;
  caseNumber: string;
  caseType: 'Civil' | 'Criminal' | 'Family' | 'Corporate' | 'Tax' | 'Property' | 'Labour' | 'Constitutional';
  caseTitle: string;
  filingDate: Date;
  status: 'Filed' | 'Under Review' | 'Hearing Scheduled' | 'In Progress' | 'Adjourned' | 'Verdict Delivered' | 'Closed' | 'Archived';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  plaintiff: Party;
  defendant: Party;
  assignedJudge: any;
  courtroom: string;
  description: string;
  documents?: Document[];
  timeline?: TimelineEvent[];
  nextHearingDate?: Date;
  verdict?: Verdict;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Party {
  name: string;
  lawyer?: any;
  contactNumber?: string;
  email?: string;
  address?: string;
}

export interface Document {
  filename: string;
  originalName: string;
  path: string;
  uploadDate: Date;
  uploadedBy: any;
  documentType: 'Petition' | 'Evidence' | 'Order' | 'Judgment' | 'Motion' | 'Affidavit' | 'Other';
}

export interface TimelineEvent {
  event: string;
  date: Date;
  description: string;
  performedBy?: any;
}

export interface Verdict {
  decision: string;
  date: Date;
  description: string;
  decidedBy: any;
}

export interface Hearing {
  _id?: string;
  case: any;
  hearingDate: Date;
  startTime: string;
  endTime?: string;
  courtroom: string;
  judge: any;
  hearingType: 'Initial' | 'Evidence' | 'Arguments' | 'Final' | 'Interim' | 'Bail' | 'Other';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Adjourned' | 'Cancelled';
  attendees?: Attendee[];
  minutes?: string;
  proceedingSummary?: string;
  nextHearingDate?: Date;
  adjournmentReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attendee {
  user: any;
  role: string;
  attended: boolean;
}

export interface Notification {
  _id?: string;
  user: string;
  type: 'Hearing' | 'Status Update' | 'Document Upload' | 'Assignment' | 'Verdict' | 'System';
  title: string;
  message: string;
  relatedCase?: any;
  relatedHearing?: any;
  isRead: boolean;
  priority: 'Low' | 'Medium' | 'High';
  readAt?: Date;
  createdAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  unreadCount?: number;
}

export interface CaseStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  casesByType: Array<{ _id: string, count: number }>;
  casesByStatus: Array<{ _id: string, count: number }>;
}
