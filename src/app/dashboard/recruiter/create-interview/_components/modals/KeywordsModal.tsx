"use client";

import React, { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addKeyword: (
    id: "type" | "keywords",
    keyword: string,
    action: "add" | "remove"
  ) => void;
}

export function KeywordsModal({ open, setOpen, addKeyword }: Props) {
  const [keyword, setKeyword] = useState<string>("");

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addKeyword("keywords", keyword, "add");
    setKeyword("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Keyword</DialogTitle>
        </DialogHeader>
        <form className="space-y-2" onSubmit={handleFormSubmit}>
          <Input
            placeholder="e.g. Next.js"
            className="min-h-10"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button className="w-full text-white min-h-10" disabled={!keyword}>
            Add Keyword
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
