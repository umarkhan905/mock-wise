"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@radix-ui/react-tabs";
import { useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Chats } from "@/components/chats/tabs/Chats";
import { IncomingRequests } from "@/components/chats/tabs/IncomingRequests";
import { BrowseUsers } from "@/components/chats/tabs/BrowseUsers";
import { Button } from "@/components/ui/button";
import { NewChatModal } from "@/components/chats/modals/new-chat/NewChatModal";
import { api } from "../../../../../convex/_generated/api";

export default function Messages() {
  const [openNewChatModal, setOpenNewChatModal] = useState<boolean>(false);

  const { userId, isLoaded } = useAuth();
  const user = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const router = useRouter();

  const onOpenChange = (open: boolean) => {
    setOpenNewChatModal(open);
  };

  if (!isLoaded || user === undefined) {
    // Handle loading state
    return <div>Loading...</div>;
  }

  if (user === null) return router.push("/");

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">
          Connect with recruiters and candidates
        </p>
      </div>

      <Card>
        <Tabs defaultValue="chats">
          {/* Card Header With Tabs and Search */}
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="chats"
                  className="data-[state=active]:bg-transparent  data-[state=active]:border-b-primary data-[state=active]:text-primary border-b-2 rounded-none pb-2 text-muted-foreground"
                >
                  Chats
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-primary data-[state=active]:text-primary border-b-2 rounded-none pb-2 text-muted-foreground"
                >
                  Incoming Requests
                </TabsTrigger>
                <TabsTrigger
                  value="browse"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-primary data-[state=active]:text-primary border-b-2 rounded-none pb-2 text-muted-foreground"
                >
                  Browse Users
                </TabsTrigger>
              </TabsList>

              <Button
                className="w-full md:w-auto min-h-10"
                variant="outline"
                onClick={() => onOpenChange(true)}
              >
                <Plus className="size-5" /> New Chat
              </Button>
            </div>
          </CardHeader>

          {/* Card Content */}
          <CardContent className="pt-6">
            <TabsContent value="chats">
              <Chats isLoaded={isLoaded} userId={user._id} />
            </TabsContent>
            <TabsContent value="requests">
              <IncomingRequests isLoaded={isLoaded} userId={user._id} />
            </TabsContent>
            <TabsContent value="browse">
              <BrowseUsers isLoaded={isLoaded} userId={user._id} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <NewChatModal
        open={openNewChatModal}
        setOpen={setOpenNewChatModal}
        userId={user._id}
      />
    </section>
  );
}
