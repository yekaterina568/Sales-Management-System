export interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: 'Active' | 'Lead' | 'Inactive';
  lastActivity?: string;
  avatar?: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  amount: number;
  status: 'New' | 'In Progress' | 'Negotiation' | 'Won' | 'Lost';
  owner?: string;
  expectedCloseDate?: string;
  notes?: Note[];
  activities?: Activity[];
  probability?: number;
  source?: string;
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  date: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
}
