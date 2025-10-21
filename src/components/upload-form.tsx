"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

const uploadSchema = z.object({
  caption: z.string().max(280, "Caption cannot exceed 280 characters."),
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

type UploadValues = z.infer<typeof uploadSchema>;

export function UploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { caption: "" },
  });

  const onSubmit = async (values: UploadValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to create a post.",
      });
      return;
    }
    setIsLoading(true);

    try {
      // 1. Upload image to ImgBB
      const formData = new FormData();
      formData.append("image", values.image[0]);

      const imgbbResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!imgbbResponse.ok) {
        throw new Error("Image upload failed. Please try again.");
      }

      const imgbbResult = await imgbbResponse.json();
      const imageUrl = imgbbResult.data.url;

      // 2. Save post to Firebase
      const postsRef = ref(db, "posts");
      await push(postsRef, {
        imageUrl,
        caption: values.caption,
        userId: user.uid,
        userName: user.displayName,
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Post created!",
        description: "Your new post is now live.",
      });
      form.reset();
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
    <Card>
      <CardHeader>
        <CardTitle>Create a New Post</CardTitle>
      </CardHeader>
      <CardContent>
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
              Post
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
