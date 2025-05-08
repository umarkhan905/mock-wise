"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RecruiterLoginForm from "./RecruiterLoginForm";
import RecruiterSignupForm from "./RecruiterSignupForm";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RecruiterAuthModal({ open, setOpen }: Props) {
  const [isSignupForm, setIsSignupForm] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSignupForm ? "Recruiter Sign Up" : "Recruiter Login"}
          </DialogTitle>
          <DialogDescription>
            {isSignupForm ? "Sign up as a recruiter" : "Login as a recruiter"}
          </DialogDescription>
        </DialogHeader>

        {isSignupForm ? <RecruiterSignupForm /> : <RecruiterLoginForm />}

        <p className="text-sm text-muted-foreground w-fit mx-auto font-medium">
          {isSignupForm
            ? "Already have an account? "
            : "Don't have an account? "}
          <span
            className="text-primary cursor-pointer hover:underline"
            onClick={() => setIsSignupForm(!isSignupForm)}
          >
            {isSignupForm ? "Login" : "Sign Up"}
          </span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
