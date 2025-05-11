export type User = {
  id: string;
  email: string;
  role: 'MENTOR' | 'MENTEE';
  mentor_id?: string;
  created_at: string;
};

export type Assignment = {
  id: string;
  mentor_id: string;
  title: string;
  description?: string;
  created_at: string;
};

export type Resource = {
  id: string;
  mentor_id: string;
  assignment_id?: string;
  title: string;
  url: string;
  created_at: string;
};

export type Submission = {
  id: string;
  assignment_id: string;
  mentee_id: string;
  snippet: string;
  completed: boolean;
  created_at: string;
  assignment_title?: string;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  submission_id: string;
  mentor_id: string;
  line_number?: number;
  comment: string;
  created_at: string;
};

export type MonitoredUser = {
  id: string;
  user_id: string;
  user_email: string;
  reason: string;
  operation_count: number;
  time_period: string;
  created_at: string;
  is_active: boolean;
};
