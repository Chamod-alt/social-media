"use client";

import * as React from "react";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showMyPosts, setShowMyPosts] = React.useState(false);

  React.useEffect(() => {
    const postsQuery = query(ref(db, "posts"), orderByChild("timestamp"));
    const unsubscribe = onValue(
      postsQuery,
      (snapshot) => {
        const postsData: Post[] = [];
        snapshot.forEach((childSnapshot) => {
          const post = childSnapshot.val();
          
          const commentsArray = post.comments ? Object.keys(post.comments).map(key => ({
            id: key,
            ...post.comments[key]
          })) : [];

          postsData.push({
            id: childSnapshot.key!,
            ...post,
            comments: commentsArray,
          });
        });
        setPosts(postsData.reverse());
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredPosts = showMyPosts 
    ? posts.filter(post => post.userId === user?.uid)
    : posts;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Button variant={showMyPosts ? "secondary" : "ghost"} onClick={() => setShowMyPosts(!showMyPosts)}>
                {showMyPosts ? "Show All Posts" : "Show My Posts"}
            </Button>
        </div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="text-center text-muted-foreground py-10">
          <p className="text-lg font-medium">{showMyPosts ? "You haven't posted anything yet." : "No posts yet!"}</p>
          <p>{showMyPosts ? "Create your first post to see it here." : "Be the first to share something on SocialVerse."}</p>
        </div>
      )}
    </div>
  );
}
