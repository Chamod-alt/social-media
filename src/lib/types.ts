import type { User as FirebaseUser } from "firebase/auth";

export interface Reply {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: number;
}
export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: number;
  replies?: Reply[];
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
  comments?: Comment[];
}

export interface UserProfile {
  username: string;
  email: string;
  avatar?: string;
}

export type AuthUser = FirebaseUser | null;
