import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30 -z-10" />
      <div className="absolute inset-0 pattern-dots -z-10 opacity-60" aria-hidden />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Now serving students across South Africa
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
              Find your perfect tutor.{" "}
              <span className="text-gradient">Excel with confidence.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Connect with qualified tutors across South Africa. Personalized learning, expert instruction, 
              and proven results for students of all levels.
            </p>

            {/* CTA Buttons - do not navigate, always side by side */}
            <div className="flex flex-row flex-wrap gap-2 sm:gap-4">
              <Button variant="accent" size="lg" className="group h-10 px-4 text-sm sm:h-12 sm:px-8 sm:text-base" type="button">
                Request a Tutor
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </Button>
              <Button variant="accent-outline" size="lg" className="group h-10 px-4 text-sm sm:h-12 sm:px-8 sm:text-base" type="button">
                Become a Tutor
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 border-t border-border/80 pt-8 mt-8">
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">5,000+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-border" aria-hidden />
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">1,200+</div>
                <div className="text-sm text-muted-foreground">Expert Tutors</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-border" aria-hidden />
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <img
                src={heroImage}
                alt="Students learning together with 123tutors"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 via-transparent to-transparent pointer-events-none" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-5 shadow-xl max-w-xs hidden lg:block animate-scale-in ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <span className="text-2xl" aria-hidden>📚</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">24/7 Support</div>
                  <div className="text-sm text-muted-foreground">Always here to help</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
