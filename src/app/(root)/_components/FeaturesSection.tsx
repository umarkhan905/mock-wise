import { featuresData } from "@/constants";
import { Check } from "lucide-react";
import React, { JSX } from "react";

export const iconMap: Record<string, JSX.Element> = {
  "ai-voice-interviews-icon": (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 12C19 14.2091 16.7614 16 14 16C11.2386 16 9 14.2091 9 12C9 9.79086 11.2386 8 14 8C16.7614 8 19 9.79086 19 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C9.79086 15 8 13.6569 8 12C8 10.3431 9.79086 9 12 9C14.2091 9 16 10.3431 16 12C16 13.6569 14.2091 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "customizable-mcq-tests-icon": (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9L11 11L15 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "interview-sharing-icon": (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 11L12 6M12 6L17 11M12 6V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 18H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "real-time-messaging-icon": (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C10.2814 21 8.68034 20.4935 7.32816 19.605L3 21L4.39499 16.6718C3.5065 15.3197 3 13.7186 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12V12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12V12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12V12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "detailed-analytics-icon": (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 6V18M12 10V18M8 14V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "mock-interview-library-icon": (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 19.5V4.5C4 3.39543 4.89543 2.5 6 2.5H18C19.1046 2.5 20 3.39543 20 4.5V19.5C20 20.6046 19.1046 21.5 18 21.5H6C4.89543 21.5 4 20.6046 4 19.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7.5H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11.5H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15.5H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-lg">
            Our platform provides comprehensive tools for both recruiters and
            candidates to streamline the interview process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={iconMap[feature.icon]}
            />
          ))}
        </div>

        <div className="mt-20 glass-morphism rounded-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-2xl font-bold mb-6">For Recruiters</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Create custom interview assessments</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Streamline candidate screening process</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Access detailed candidate reports</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Share interview links with candidates</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">For Candidates</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Practice with AI-powered mock interviews</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Receive instant feedback on your responses</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Track your progress over time</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-primary">
                    <Check size={18} />
                  </div>
                  <span>Access industry-specific practice interviews</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="glass-morphism rounded-xl p-6 h-full">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};
