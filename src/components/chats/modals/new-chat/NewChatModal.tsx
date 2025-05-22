"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounceCallback } from "usehooks-ts";
import { SuggestedUsers } from "../new-chat/SuggestedUsers";
import { SearchedUsers } from "../new-chat/SearchedUsers";
import { Id } from "../../../../../convex/_generated/dataModel";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: Id<"users">;
}

export function NewChatModal({ open, setOpen, userId }: Props) {
  const [search, setSearch] = useState<string>("");

  const debounced = useDebounceCallback(setSearch, 300);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setSearch("");
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto max-h-[90vh] scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Start a new chat</DialogTitle>
          <DialogDescription>
            Select a user to start a new chat with. You can also send them a
            request to connect.
          </DialogDescription>
        </DialogHeader>

        {/* search bar */}
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search for users..."
            className="w-full min-h-12"
            defaultValue={search}
            onChange={(e) => {
              debounced(e.target.value);
            }}
          />
          <Button
            className="min-h-10 absolute right-1 top-1 text-white"
            size="sm"
          >
            <Search className="size-5" />
          </Button>
        </div>

        {search ? (
          <SearchedUsers searchTerm={search} userId={userId} />
        ) : (
          <SuggestedUsers userId={userId} />
        )}
      </DialogContent>
    </Dialog>
  );
}
