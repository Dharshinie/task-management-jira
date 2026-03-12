export type UserRole = 'admin' | 'tl' | 'intern';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
  // Add other fields as needed
}