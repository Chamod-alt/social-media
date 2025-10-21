"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadForm } from "@/components/upload-form";

export function CreatePostDialog() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>
        <UploadForm onFormSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
