import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md inline-flex" aria-label="123tutors home">
              <Logo size="sm" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:w-0 after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full"
            >
              Features
            </a>
            <a
              href="#bursaries"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:w-0 after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full"
            >
              Bursary Clients
            </a>
            <a
              href="#testimonials"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:w-0 after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full"
            >
              Testimonials
            </a>
          </div>

          {/* Desktop CTA - buttons do not navigate */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" type="button">
              Sign In
            </Button>
            <Button variant="accent" size="sm" type="button">
              Request a Tutor
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a
              href="#features"
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#bursaries"
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Bursary Clients
            </a>
            <a
              href="#testimonials"
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <div className="pt-4 space-y-2">
              <Button variant="ghost" size="sm" className="w-full" type="button" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Button>
              <Button variant="accent" size="sm" className="w-full" type="button" onClick={() => setIsMenuOpen(false)}>
                Request a Tutor
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
