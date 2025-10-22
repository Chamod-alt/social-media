"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { push, serverTimestamp } from "firebase/database";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import type { Post } from "@/lib/types";

const uploadSchema = z.object({
  caption: z.string().max(280, "Caption cannot exceed 280 characters.").optional(),
  image: z
    .any()
    .refine((files) => files?.length === 1, "Image is required.")
    .refine(
      (files) => files?.[0]?.size <= 5000000,
      `Max file size is 5MB.`
    )
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          files?.[0]?.type
        ),
      "Only .jpg, .png, .gif, and .webp formats are supported."
    ),
});

const editSchema = z.object({
    caption: z.string().max(280, "Caption cannot exceed 280 characters.").optional(),
    image: z.any().optional(),
});


type UploadValues = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  post?: Post;
  onPostUpdated?: () => void;
  onFormSubmit?: () => void;
}

export function UploadForm({ post, onPostUpdated, onFormSubmit }: UploadFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditing = !!post;

  const form = useForm<UploadValues>({
    resolver: zodResolver(isEditing ? editSchema : uploadSchema),
    defaultValues: {
      caption: post?.caption || "",
      image: undefined,
    },
  });

  const onSubmit = async (values: UploadValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to create or edit a post.",
      });
      return;
    }
    setIsLoading(true);

    try {
      
      if (isEditing && post.id) {
        let imageUrl = post.imageUrl;
        if(values.image?.[0]){
            const formData = new FormData();
            formData.append("image", values.image[0]);

            const imgbbResponse = await fetch(
            `https://api.imgbb.com/1/upload?key=52c3c97163788d752e21fb5a9ac01b22`,
            {
                method: "POST",
                body: formData,
            }
            );
            if (!imgbbResponse.ok) {
                throw new Error("Image upload failed. Please try again.");
              }
      
            const imgbbResult = await imgbbResponse.json();
            imageUrl = imgbbResult.data.url;
        }

        const postRef = ref(db, `posts/${post.id}`);
        await update(postRef, {
            caption: values.caption || post.caption,
            imageUrl: imageUrl,
        });

        toast({
            title: "Post updated!",
            description: "Your post has been successfully updated.",
        });
        onPostUpdated?.();
      } else {
        let imageUrl;
        if(values.image?.[0]){
            const formData = new FormData();
            formData.append("image", values.image[0]);

            const imgbbResponse = await fetch(
            `https://api.imgbb.com/1/upload?key=52c3c97163788d752e21fb5a9ac01b22`,
            {
                method: "POST",
                body: formData,
            }
            );

            if (!imgbbResponse.ok) {
                throw new Error("Image upload failed. Please try again.");
            }
    
            const imgbbResult = await imgbbResponse.json();
            imageUrl = imgbbResult.data.url;
        }
        // 2. Save new post to Firebase
        const postsRef = ref(db, "posts");
        await push(postsRef, {
            imageUrl,
            caption: values.caption,
            userId: user.uid,
            userName: user.displayName,
            userAvatar: user.photoURL,
            timestamp: serverTimestamp(),
            likes: {},
            comments: {}
        });
        toast({
            title: "Post created!",
            description: "Your new post is now live.",
        });
      }

      form.reset();
      onFormSubmit?.();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's on your mind?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              {post?.imageUrl && (
                  <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Current image:</p>
                      <img src={post.imageUrl} alt="Current post" className="w-full h-auto rounded-md mt-1 max-h-48 object-cover"/>
                  </div>
              )}
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEditing ? "Save Changes" : "Post"}
        </Button>
      </form>
    </Form>
  );
}
