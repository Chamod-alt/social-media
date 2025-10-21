import type { User as FirebaseUser } from "firebase/auth";

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: number;
}
export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  userId: string;
  userName:string;
  userAvatar?: string;
  timestamp: number;
  likes?: { [userId: string]: boolean };
  comments?: { [commentId: string]: Comment };
}

export interface UserProfile {
  username: string;
  email: string;
  avatar?: string;
}

export type AuthUser = FirebaseUser | null;
