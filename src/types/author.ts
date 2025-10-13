export interface Author {
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: 'admin' | 'author';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface AuthorApplication {
  _id?: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  inviteToken?: string;
}

export interface ArticleSubmission {
  _id?: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}