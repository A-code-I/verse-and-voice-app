
export interface DevotionalReading {
  id: string;
  title: string;
  content: string;
  devotional_date: string;
  bible_references?: string[];
  type: string;
  created_at: string;
  updated_at: string;
}
