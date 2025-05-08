"use client";

import FormError from "@/components/error/FormError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { ClerkAPIError } from "@clerk/types";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

type FormData = {
  username: string;
  company: string;
  email: string;
  password: string;
};

export default function RecruiterSignupForm() {
  const { isLoaded, signUp } = useSignUp();

  const [error, setError] = useState<string | undefined>(undefined);
  const [clerkErrors, setClerkErrors] = useState<ClerkAPIError[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    company: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setClerkErrors(undefined);
    setLoading(true);

    if (!isLoaded) return;

    const hasEmptyFields = Object.values(formData).some((value) => !value);
    if (hasEmptyFields) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      await signUp.create({
        username: formData.username,
        emailAddress: formData.email,
        password: formData.password,
        unsafeMetadata: {
          companyName: formData.company,
          role: "recruiter",
        },
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      router.push("/verify-email");
    } catch (error) {
      console.log("Error while signing up", error);
      if (isClerkAPIResponseError(error)) setClerkErrors(error.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSignup}>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          className="min-h-10"
          value={formData?.username}
          onChange={onChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company Name</Label>
        <Input
          id="company"
          type="text"
          placeholder="Enter your company name"
          className="min-h-10"
          value={formData?.company}
          onChange={onChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="min-h-10"
          value={formData?.email}
          onChange={onChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="min-h-10"
          value={formData?.password}
          onChange={onChange}
        />
      </div>

      {/* Captcha */}
      <div
        id="clerk-captcha"
        data-cl-theme="dark"
        data-cl-size="flexible"
        data-cl-language="es-ES"
      />

      {(error || (clerkErrors && clerkErrors.length > 0)) && (
        <FormError message={error || clerkErrors?.[0].message} />
      )}

      <Button
        type="submit"
        className="w-full min-h-10 text-white"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin size-5" /> : "Sign Up"}
      </Button>
    </form>
  );
}
