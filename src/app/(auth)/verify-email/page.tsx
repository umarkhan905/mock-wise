"use client";

import React, { useState } from "react";
import { ClerkAPIError } from "@clerk/types";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import FormError from "@/components/error/FormError";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyEmail() {
  const { isLoaded, setActive, signUp } = useSignUp();
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ClerkAPIError[]>();

  const router = useRouter();

  const handleVerifyAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(undefined);
    setLoading(true);

    if (!isLoaded) return;

    try {
      const verifyAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (verifyAttempt.status === "complete") {
        await setActive({ session: verifyAttempt.createdSessionId });
        router.push("/dashboard/recruiter");
      }
    } catch (error) {
      console.log("Error while verifying account", error);
      if (isClerkAPIResponseError(error)) setErrors(error.errors);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Verify Your Account</CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to your email. Enter the code
            below to verify.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerifyAccount} className="space-y-4">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    index={index}
                    key={index}
                    className="size-13 text-center text-xl border rounded-md mx-1"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {errors && errors.length > 0 && (
              <FormError message={errors[0].longMessage} />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="min-h-10 w-full text-white r"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
