interface LogoProps {
  className?: string;
  /** Size: sm (navbar), md (footer), lg */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xl gap-1",
  md: "text-2xl gap-1.5",
  lg: "text-3xl gap-2",
};

const circleSizes = {
  sm: "h-12 w-12 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-16 w-16 text-base",
};

const Logo = ({ className = "", size = "md" }: LogoProps) => {
  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      <span
        className={`flex items-center justify-center rounded-full bg-accent text-accent-foreground font-bold shrink-0 ${circleSizes[size]}`}
      >
        123
      </span>
      <span className="text-gradient">tutors</span>
    </span>
  );
};

export default Logo;
