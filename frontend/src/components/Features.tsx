import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Calendar, TrendingUp, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Tutors",
    description: "Connect with qualified, vetted tutors across all subjects and grade levels. Every tutor is carefully screened for expertise and teaching excellence.",
  },
  {
    icon: Users,
    title: "Personalized Matching",
    description: "Our intelligent matching system pairs you with tutors who fit your learning style, schedule, and academic goals perfectly.",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book sessions that work for you. Morning, afternoon, or evening - learn on your schedule with easy rescheduling options.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor improvement with detailed progress reports, session notes, and performance analytics to celebrate every milestone.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your data and privacy are protected with bank-level encryption. Secure payments and verified tutor identities ensure peace of mind.",
  },
  {
    icon: Zap,
    title: "Instant Sessions",
    description: "Need help now? Connect with available tutors instantly for urgent homework help or exam preparation support.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient">succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive platform designed to make learning accessible, effective, and enjoyable for everyone.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="hover-lift border-border/50 bg-background/50 backdrop-blur-sm"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: "fade-in-up 0.6s ease-out forwards",
                opacity: 0,
              }}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
