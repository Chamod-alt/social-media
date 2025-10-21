import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, UserCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = post.timestamp
    ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
    : "just now";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Avatar>
          <AvatarImage src={post.userAvatar} alt={post.userName} />
          <AvatarFallback>
            <UserCircle className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <p className="font-semibold">{post.userName}</p>
          <p className="text-sm text-muted-foreground">{timeAgo}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {post.caption && <p className="px-6">{post.caption}</p>}
        {post.imageUrl && (
          <div className="relative aspect-video w-full">
            <Image
              src={post.imageUrl}
              alt={post.caption || "Post image"}
              fill
              className="object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex w-full items-center gap-2">
          <Button variant="ghost" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            Like
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Comment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
