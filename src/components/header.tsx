"use client";

import { signOut } from "firebase/auth";
import * as React from "react";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ref, onValue, update } from "firebase/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post, Comment } from "@/lib/types";

const NotificationItem = ({ comment }: { comment: Comment }) => {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg">
      <Avatar className="h-9 w-9">
        <AvatarImage src={comment.userAvatar} />
        <AvatarFallback>
          <UserCircle />
        </AvatarFallback>
      </Avatar>
      <div className="text-sm">
        <p>
          <span className="font-semibold">{comment.userName}</span> commented on
          your post: "{comment.postCaption && comment.postCaption.length > 20 ? `${comment.postCaption.substring(0, 20)}...` : comment.postCaption}"
        </p>
        <p className="text-muted-foreground italic mt-1">"{comment.text}"</p>
        <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export function Header() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Comment[]>([]);

  React.useEffect(() => {
    if (!user) return;

    const postsRef = ref(db, "posts");
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const allPosts: Post[] = [];
      snapshot.forEach((childSnapshot) => {
        allPosts.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });

      const myPosts = allPosts.filter((post) => post.userId === user.uid);
      const newNotifications: Comment[] = [];

      myPosts.forEach((post) => {
        if (post.comments) {
          const postComments = Object.keys(post.comments).map(key => ({
            id: key,
            ...post.comments![key as any],
            postId: post.id,
            postCaption: post.caption,
          }));
          
          postComments.forEach((comment) => {
            // A notification is for a comment made by another user on my post, which hasn't been read
            if (comment.userId !== user.uid && !comment.read) {
              newNotifications.push(comment);
            }
          });
        }
      });
      // Sort notifications by timestamp descending
      setNotifications(newNotifications.sort((a, b) => b.timestamp - a.timestamp));
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      });
    }
  };

  const handleOpenNotifications = () => {
    if (notifications.length === 0) return;

    const updates: { [key: string]: any } = {};
    notifications.forEach((notif) => {
      updates[`/posts/${notif.postId}/comments/${notif.id}/read`] = true;
    });

    update(ref(db), updates);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            SocialVerse
          </h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Popover onOpenChange={(open) => open && handleOpenNotifications()}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {notifications.length}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                    <div className="p-3 font-semibold text-lg border-b">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <NotificationItem key={notif.id} comment={notif} />
                        ))
                    ) : (
                        <p className="p-4 text-sm text-muted-foreground text-center">No new notifications.</p>
                    )}
                    </div>
                </PopoverContent>
            </Popover>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
