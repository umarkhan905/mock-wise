import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filters, NotificationType } from "@/types";

const typeFilters = ["all", "interview", "system", "reminder"] as const;
const statusFilters = ["all", "unread", "read"] as const;

interface Props {
  filter: Filters;
  type: NotificationType;
  unReadNotifications: number;
  search: string;
  onSearchChange: (search: string) => void;
  onFilterChange: (filter: Filters) => void;
  onTypeChange: (type: NotificationType) => void;
}

export function NotificationFilter({
  filter,
  type,
  unReadNotifications,
  search,
  onSearchChange,
  onFilterChange,
  onTypeChange,
}: Props) {
  return (
    <section className="space-y-4">
      {/* Search */}

      <Input
        type="text"
        placeholder="Search"
        className="max-w-md min-h-10"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="text-white min-h-10" variant={"outline"}>
              Status
              <ChevronDown className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[100000]">
            {statusFilters.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onFilterChange(status)}
                className={`cursor-pointer ${status === filter && "bg-primary/20"} capitalize`}
              >
                {status}
                {status === "unread" && (
                  <Badge
                    className="ml-2 bg-primary/60 rounded-full size-5"
                    variant={"outline"}
                  >
                    {unReadNotifications || 0}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="text-white min-h-10" variant={"outline"}>
              Type
              <ChevronDown className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[100000]">
            {typeFilters.map((filter) => (
              <DropdownMenuItem
                key={filter}
                onClick={() => onTypeChange(filter)}
                className={`cursor-pointer ${filter === type && "bg-primary/20"} capitalize`}
              >
                {filter}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
