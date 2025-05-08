"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@clerk/nextjs";
import React, { useState } from "react";
import { ClerkAPIError } from "@clerk/types";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { Loader2 } from "lucide-react";
import FormError from "@/components/error/FormError";

export default function RecruiterLoginForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setpassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ClerkAPIError[]>();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors(undefined);

    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/dashboard/recruiter");
      }
    } catch (error) {
      console.log("Error while logging in", error);
      if (isClerkAPIResponseError(error)) setErrors(error.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="identifier">Email or Username</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="Enter your email or username"
          className="min-h-10"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="min-h-10"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
        />

        <div className="flex items-center justify-end">
          <p className="text-sm text-secondary font-medium cursor-pointer hover:text-primary transition-all duration-300 ">
            Forgot Password?
          </p>
        </div>
      </div>

      {errors && errors?.length > 0 && (
        <FormError message={errors[0].message} />
      )}

      <Button
        type="submit"
        className="w-full min-h-10 text-white"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin size-5" /> : "Login"}
      </Button>
    </form>
  );
}
