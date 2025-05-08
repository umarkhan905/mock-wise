import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function HeroSection() {
  return (
    <main className="relative min-h-screen flex items-center z-0">
      {/* Background Elements */}
      <section className="absolute inset-0 overflow-hidden -z-1">
        <div className="absolute top-[10%] right-[10%] w-72 h-72 bg-primary/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl"></div>
      </section>

      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                <div className="h-4 w-4 rounded-full bg-primary"></div>
              </div>
              <p className="text-primary font-medium">
                AI-Powered Interview Platform
              </p>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Master Your <span className="text-gradient">Interviews</span> with
              AI Assistance
            </h1>

            <p className="text-lg text-gray-400">
              MockWise helps candidates practice for interviews and enables
              recruiters to conduct efficient screenings with our advanced AI
              interview simulation technology.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Button
                className="bg-primary text-white px-8 py-6 text-lg"
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>

              <Button
                variant="outline"
                className="text-light border-light/30 px-8 py-6 text-lg"
              >
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-dark"></div>
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-dark"></div>
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-dark"></div>
              </div>
              <p className="text-gray-400 text-sm">
                Join over <span className="text-white">3,000+</span> users
              </p>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="glass-morphism rounded-xl p-1 max-w-md">
              <img
                src="/logo.png"
                alt="AI Interview Assistant"
                className="rounded-lg w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 glass-morphism rounded-lg p-4 max-w-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-300">Live Interview Session</p>
              </div>
              <p className="text-xs text-gray-400">
                Our AI is analyzing your responses in real-time to provide
                instant feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
