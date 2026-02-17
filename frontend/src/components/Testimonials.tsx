import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "123tutors matched me with a tutor who finally made maths make sense. My grades improved in one term.",
    author: "S. Mtshweni",
    role: "Grade 11 student, Johannesburg",
  },
  {
    quote: "Flexible scheduling and real expertise. My daughter looks forward to her sessions every week.",
    author: "K. Nkuna",
    role: "Parent, Pretoria",
  },
  {
    quote: "As a tutor, the platform is easy to use and I get to help students across the country.",
    author: "M. Nkwana",
    role: "Tutor, Pretoria",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            What <span className="text-gradient">students & parents</span> say
          </h2>
          <p className="text-sm text-muted-foreground">
            Real stories from the 123tutors community.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="relative rounded-xl border border-border bg-card/50 p-4 text-left animate-fade-in-up opacity-0"
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Quote className="h-5 w-5 text-accent/30 mb-2" aria-hidden />
              <p className="text-foreground text-sm leading-relaxed mb-3">&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <cite className="not-italic font-semibold text-foreground text-sm">{t.author}</cite>
                <span className="text-muted-foreground text-xs block">{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
