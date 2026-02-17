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
    <section id="features" className="py-12 sm:py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - compact on mobile */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16 space-y-2 sm:space-y-4 animate-fade-in-up">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient">succeed</span>
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground px-0 sm:px-0">
            A comprehensive platform designed to make learning accessible, effective, and enjoyable for everyone.
          </p>
        </div>

        {/* Features Grid - 2 cols on mobile, 2 on sm, 3 on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group card-hover border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in-up opacity-0 p-4 sm:p-0"
              style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: "forwards",
              }}
            >
              <CardHeader className="p-0 sm:p-6 pb-2 sm:pb-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mb-3 sm:mb-4 transition-colors group-hover:bg-accent/20 shrink-0">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <CardTitle className="text-base sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                <CardDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground line-clamp-3 sm:line-clamp-none">
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
