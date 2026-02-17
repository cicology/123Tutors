import { Search, UserCheck, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Find Your Tutor",
    description: "Browse our diverse network of expert tutors. Filter by subject, availability, and teaching style to find your perfect match.",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Book a Session",
    description: "Select a time that works for you and book your first session. No commitments, cancel anytime with our flexible policies.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Start Learning",
    description: "Connect with your tutor online or in-person. Engage in personalized lessons designed specifically for your goals.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple, powerful,{" "}
            <span className="text-gradient">effective</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting started with 123tutors is easy. Follow these simple steps to begin your learning journey.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group"
              style={{
                animationDelay: `${index * 0.15}s`,
                animation: "fade-in-up 0.6s ease-out forwards",
                opacity: 0,
              }}
            >
              {/* Connector Line (hidden on mobile, last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0" />
              )}

              <div className="relative bg-background border border-border rounded-2xl p-8 space-y-4 hover-lift z-10">
                {/* Step Number */}
                <div className="text-6xl font-bold text-accent/10 absolute top-4 right-6 select-none">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center relative z-10">
                  <step.icon className="h-7 w-7 text-accent" />
                </div>

                {/* Content */}
                <div className="space-y-2 relative z-10">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
};

export default HowItWorks;
