import type { User as FirebaseUser } from "firebase/auth";

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: number;
}

export interface UserProfile {
  username: string;
  email: string;
  avatar?: string;
}

export type AuthUser = FirebaseUser | null;
