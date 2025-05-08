import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRecruiterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
  open,
  setOpen,
  setRecruiterModalOpen,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <Link href={"/"} className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="logo"
                className="rounded-full bg-primary/30"
                width={40}
                height={40}
              />
              Mock<span className="text-primary">Wise</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <section className="p-4">
          <ul className="w-full space-y-2">
            <li className="p-2 bg-primary/10 hover:bg-primary cursor-pointer transition-all duration-300 rounded-md">
              <Link href="#features">Features</Link>
            </li>
            <li className="p-2 bg-primary/10 hover:bg-primary cursor-pointer transition-all duration-300 rounded-md">
              <Link href="#pricing">Pricing</Link>
            </li>
            <li
              className="p-2 bg-primary/10 hover:bg-primary cursor-pointer transition-all duration-300 rounded-md"
              onClick={() => setRecruiterModalOpen(true)}
            >
              Recruiter&apos;s Login
            </li>
            <li className="p-2 bg-primary/10 hover:bg-primary cursor-pointer transition-all duration-300 rounded-md">
              <SignInButton
                mode="modal"
                signUpForceRedirectUrl={"/dashboard/candidate"}
              >
                Candidate&apos;s Login
              </SignInButton>
            </li>
          </ul>
        </section>
      </SheetContent>
    </Sheet>
  );
}
