export type Note = {
  id: string;
  text: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  country?: string;
  source?: string;
  isPinned?: boolean;
  isArchived?: boolean;
};
