export enum PostStatus {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING',
  WRITING = 'WRITING',
  CONNECTING_WP = 'CONNECTING_WP',
  DRAFTING = 'DRAFTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface WordPressSettings {
  siteUrl: string;
  username: string;
  appPassword: string;
  isConnected: boolean;
}

export interface ResearchSource {
  title: string;
  uri: string;
}

export interface GeneratedPost {
  title: string;
  content: string; // HTML content
  researchSummary: string;
  sources: ResearchSource[];
  wordpressLink?: string;
}

export interface BlogPostRecord {
  id: string;
  topic: string;
  date: string;
  status: 'Draft' | 'Published' | 'Scheduled';
  wordpressId?: number;
}
