"use client";

import * as React from "react";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/lib/types";

export function Feed() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const postsQuery = query(ref(db, "posts"), orderByChild("timestamp"));
    const unsubscribe = onValue(
      postsQuery,
      (snapshot) => {
        const postsData: Post[] = [];
        snapshot.forEach((childSnapshot) => {
          const post = childSnapshot.val();
          
          // Convert comments object to array
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
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="text-center text-muted-foreground py-10">
          <p className="text-lg font-medium">No posts yet!</p>
          <p>Be the first to share something on SocialVerse.</p>
        </div>
      )}
    </div>
  );
}
