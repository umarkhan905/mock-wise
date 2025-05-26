import React from "react";
import { Input } from "@/components/ui/input";
import { Filter, FilterX, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CandidateFilters, RecruiterFilters } from "@/types";
import { defaultCandidateFilters } from "@/constants";

interface Props {
  search: string;
  filters: CandidateFilters;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setFilters: React.Dispatch<React.SetStateAction<CandidateFilters>>;
}

export function InterviewFilters({
  filters,
  search,
  setSearch,
  setFilters,
}: Props) {
  const handleFilterChange = (
    value: string | undefined,
    change: keyof RecruiterFilters
  ) => {
    setFilters({
      ...filters,
      [change]: value,
    });
  };

  const showResetButton = Object.values(filters)
    .filter((v) => v)
    .filter((v) => v !== "desc")
    .some((value) => value !== "all");

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Input
          placeholder="Search by title..."
          className="min-h-10  placeholder:text-sm pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Search className="size-5 absolute left-0 top-1/2 translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Filters Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="min-h-10" variant="outline">
            <Filter className="size-5" />
            <span>Filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Interview Filters</SheetTitle>
            <SheetDescription>
              Use the filters below to narrow down interviews by date, status,
              or assessment. Adjust the options to quickly find the interviews
              you are looking for.
            </SheetDescription>
          </SheetHeader>

          {/* Filters */}
          <section className="space-y-4 px-4">
            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange(value, "status")}
            >
              <SelectTrigger className="min-h-10 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="created">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty */}
            <Select
              value={filters.difficulty}
              onValueChange={(value) => handleFilterChange(value, "difficulty")}
            >
              <SelectTrigger className="min-h-10 w-full">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Experience */}
            <Select
              value={filters.experience}
              onValueChange={(value) => handleFilterChange(value, "experience")}
            >
              <SelectTrigger className="min-h-10 w-full">
                <SelectValue placeholder="Experience In" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>

            {/* Creation Order */}
            <Select
              value={filters.oderBy}
              onValueChange={(value) => handleFilterChange(value, "oderBy")}
            >
              <SelectTrigger className="min-h-10 w-full">
                <SelectValue placeholder="Order By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Oldest First</SelectItem>
                <SelectItem value="desc">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset */}
            {showResetButton && (
              <Button
                variant="outline"
                className="w-full min-h-10"
                onClick={() => setFilters(defaultCandidateFilters)}
                type="button"
              >
                <FilterX className="size-5" />
                <span>Reset Filters</span>
              </Button>
            )}
          </section>
        </SheetContent>
      </Sheet>
    </div>
  );
}
