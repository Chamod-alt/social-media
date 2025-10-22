"use client";

import Image from "next/image";
import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, UserCircle, MoreVertical, Trash2, Edit } from "lucide-react";
import { ref, update, remove, push, serverTimestamp, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadForm } from "./upload-form";
import type { Post, Comment } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


interface PostCardProps {
  post: Post;
}

const SeeMore = ({ text, maxLength }: { text: string; maxLength: number }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    if (text.length <= maxLength) {
        return <p className="px-6 whitespace-pre-wrap">{text}</p>;
    }

    return (
        <div className="px-6">
            <p className="whitespace-pre-wrap">
                {isExpanded ? text : `${text.substring(0, maxLength)}...`}
            </p>
            <Button variant="link" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="px-0">
                {isExpanded ? "See less" : "See more"}
            </Button>
        </div>
    );
};

const CommentSection = ({ post }: { post: Post }) => {
    const { user } = useAuth();
    const [newComment, setNewComment] = React.useState("");
    const [editingComment, setEditingComment] = React.useState<{id: string, text: string} | null>(null);
    const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState("");

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        const commentsRef = ref(db, `posts/${post.id}/comments`);
        const newCommentData: Omit<Comment, 'id' | 'postId'> = {
            text: newComment,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userAvatar: user.photoURL || undefined,
            timestamp: serverTimestamp() as number,
            read: post.userId === user.uid // Mark as read if you're commenting on your own post
        };

        push(commentsRef, newCommentData);
        setNewComment("");
    };

    const handleReplySubmit = (commentId: string) => {
        if (!user || !replyText.trim()) return;
        const repliesRef = ref(db, `posts/${post.id}/comments/${commentId}/replies`);
        push(repliesRef, {
            text: replyText,
            userId: user.uid,
            userName: user.displayName,
            userAvatar: user.photoURL,
            timestamp: serverTimestamp(),
        });
        setReplyText("");
        setReplyingTo(null);
    };

    const handleUpdateComment = () => {
        if (!user || !editingComment) return;

        const commentRef = ref(db, `posts/${post.id}/comments/${editingComment.id}`);
        update(commentRef, { text: editingComment.text });
        setEditingComment(null);
    };

    const handleDeleteComment = (commentId: string) => {
        // Post owner or comment owner can delete
        const comment = post.comments?.find(c => c.id === commentId);
        if (!user || (user.uid !== post.userId && user.uid !== comment?.userId)) return;
        
        const commentRef = ref(db, `posts/${post.id}/comments/${commentId}`);
        remove(commentRef);
    };

    return (
        <div className="w-full mt-4 space-y-2">
            <form onSubmit={handleCommentSubmit} className="flex w-full items-center gap-2 pt-4 border-t">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback><UserCircle /></AvatarFallback>
                </Avatar>
                <Input 
                    placeholder="Write a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="h-9"
                />
                <Button type="submit" size="sm" disabled={!newComment.trim()}>Post</Button>
            </form>

            {post.comments && post.comments.map((comment) => (
                <div key={comment.id} className="flex flex-col items-start gap-2 text-sm group pt-2">
                    <div className="flex items-start gap-2 w-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.userAvatar} />
                            <AvatarFallback><UserCircle /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-2">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{comment.userName}</p>
                                {(user?.uid === comment.userId || user?.uid === post.userId) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {user?.uid === comment.userId && (
                                            <DropdownMenuItem onClick={() => setEditingComment({id: comment.id, text: comment.text})}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete this comment.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                )}
                            </div>

                            {editingComment?.id === comment.id ? (
                            <div className="flex gap-2 mt-1">
                                <Input 
                                value={editingComment.text} 
                                onChange={(e) => setEditingComment({...editingComment, text: e.target.value})}
                                className="h-8"
                                />
                                <Button size="sm" onClick={handleUpdateComment}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>Cancel</Button>
                            </div>
                            ) : (
                            <p>{comment.text}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                </p>
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                                    Reply
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Replies Section */}
                    <div className="pl-10 w-full space-y-2">
                        {comment.replies && Object.values(comment.replies).map((reply: any, index: number) => (
                             <div key={index} className="flex items-start gap-2 text-sm group">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.userAvatar} />
                                    <AvatarFallback><UserCircle /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/50 rounded-lg p-2">
                                     <p className="font-semibold">{reply.userName}</p>
                                     <p>{reply.text}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                         {replyingTo === comment.id && (
                            <div className="flex w-full items-center gap-2 pt-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || undefined} />
                                    <AvatarFallback><UserCircle /></AvatarFallback>
                                </Avatar>
                                <Input 
                                    placeholder={`Replying to ${comment.userName}`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="h-9"
                                />
                                <Button type="button" size="sm" onClick={() => handleReplySubmit(comment.id)} disabled={!replyText.trim()}>Reply</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};


export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const timeAgo = post.timestamp
    ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
    : "just now";

  const likesCount = post.likes ? Object.keys(post.likes).length : 0;
  const isLiked = user && post.likes && post.likes[user.uid];

  const handleLike = () => {
    if (!user) return;
    const postRef = ref(db, `posts/${post.id}/likes`);
    const newLikes = { ...post.likes };
    if (isLiked) {
      delete newLikes[user.uid];
    } else {
      newLikes[user.uid] = true;
    }
    update(ref(db, `posts/${post.id}`), { likes: newLikes });
  };
  
  const handleDeletePost = () => {
    if (user?.uid !== post.userId) return;
    const postRef = ref(db, `posts/${post.id}`);
    remove(postRef);
  };

  const [isEditPostOpen, setIsEditPostOpen] = React.useState(false);


  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Avatar>
          <AvatarImage src={post.userAvatar} alt={post.userName} />
          <AvatarFallback>
            <UserCircle className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5 flex-1">
          <p className="font-semibold">{post.userName}</p>
          <p className="text-sm text-muted-foreground">{timeAgo}</p>
        </div>
        {user?.uid === post.userId && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                     <Dialog open={isEditPostOpen} onOpenChange={setIsEditPostOpen}>
                        <DialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Post</DialogTitle>
                            </DialogHeader>
                            <UploadForm post={post} onPostUpdated={() => setIsEditPostOpen(false)} />
                        </DialogContent>
                    </Dialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your post.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeletePost} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {post.caption && <SeeMore text={post.caption} maxLength={150} />}
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
      <CardFooter className="pt-4 flex-col items-start">
        <Collapsible asChild>
            <div className="w-full">
              <div className="flex w-full items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleLike}>
                      <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      Like ({likesCount})
                  </Button>
                  <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Comment ({post.comments?.length || 0})
                      </Button>
                  </CollapsibleTrigger>
              </div>
              <CollapsibleContent asChild>
                  <CommentSection post={post} />
              </CollapsibleContent>
            </div>
        </Collapsible>
      </CardFooter>
    </Card>
  );
}
