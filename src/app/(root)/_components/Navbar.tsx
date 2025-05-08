"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import RecruiterAuthModal from "./modal/RecruiterAuthModal";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [openRecruiterModal, setOpenRecruiterModal] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`w-full fixed top-0 z-50 transition-all duration-300 px-6 py-2.5 ${
        isScrolled ? "bg-dark/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div>
            <Image
              className="rounded-full bg-primary/30"
              src="/logo.png"
              alt="MockWise Logo"
              width={40}
              height={40}
            />
          </div>
          <span className="text-2xl font-bold text-white">
            Mock<span className="text-primary ml-1">Wise</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-gray-300 hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-gray-300 hover:text-primary transition-colors"
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpenRecruiterModal(true)}
            className="hidden md:block"
          >
            Recuriter&apos;s Login
          </button>

          <SignInButton
            mode="modal"
            signUpForceRedirectUrl={"/dashboard/candidate"}
          >
            <Button className="text-white rounded-full hidden md:block">
              Candidate&apos;s Login
            </Button>
          </SignInButton>
          <Button
            size={"icon"}
            className="md:hidden"
            onClick={() => setOpenSidebar(true)}
          >
            <Menu className="text-white size-5" />
          </Button>

          {/* Sidebar */}
          <Sidebar
            open={openSidebar}
            setOpen={setOpenSidebar}
            setRecruiterModalOpen={setOpenRecruiterModal}
          />

          {/* Recruiter Auth Modal */}
          <RecruiterAuthModal
            open={openRecruiterModal}
            setOpen={setOpenRecruiterModal}
          />
        </div>
      </div>
    </nav>
  );
}
