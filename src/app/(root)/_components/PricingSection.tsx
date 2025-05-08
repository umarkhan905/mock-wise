import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingPlan = ({
  name,
  price,
  description,
  features,
  isPopular = false,
  buttonText = "Get Started",
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
}) => {
  return (
    <div
      className={`relative glass-morphism rounded-xl p-8 flex flex-col h-full ${
        isPopular
          ? "border-primary shadow-[0_0_30px_rgba(14,165,233,0.15)]"
          : ""
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Free" && (
            <span className="text-gray-400 mb-1">/month</span>
          )}
        </div>
        <p className="text-gray-400">{description}</p>
      </div>

      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex gap-3">
            <div className="mt-1 text-primary flex-shrink-0">
              <Check size={18} />
            </div>
            <span className="text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`w-full ${
          isPopular
            ? "bg-primary hover:bg-primary/90 text-white"
            : "bg-secondary hover:bg-secondary/80 text-white"
        }`}
      >
        {buttonText}
      </Button>
    </div>
  );
};

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-[30%] w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 text-lg">
            Choose the plan that fits your needs. All plans include core
            features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PricingPlan
            name="Free"
            price="Free"
            description="For candidates who want to practice interviews."
            features={[
              "5 AI mock interviews per month",
              "Basic skills assessment",
              "Access to common interview questions",
              "Performance tracking",
            ]}
            buttonText="Sign Up Free"
          />

          <PricingPlan
            name="Professional"
            price="$29"
            description="For serious job seekers and recruiters."
            features={[
              "Unlimited AI mock interviews",
              "Advanced skills assessment",
              "Industry-specific question sets",
              "Detailed performance analytics",
              "Voice interview simulations",
              "Recruiter dashboard (basic)",
            ]}
            isPopular={true}
          />

          <PricingPlan
            name="Enterprise"
            price="$99"
            description="For organizations with advanced needs."
            features={[
              "Everything in Professional",
              "Custom branding",
              "Team management",
              "API access",
              "Advanced reporting & analytics",
              "Priority support",
              "Unlimited candidate assessments",
            ]}
            buttonText="Contact Sales"
          />
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Need a custom solution for your organization?
          </p>
          <Button
            variant="outline"
            className="mt-4 border-primary/50 text-primary hover:bg-primary/10"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
