import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const bursaries = [
  {
    id: 1,
    logoKey: "Feenix Trust",
    displayTitle: "Feenix Trust",
    description:
      "A crowdfunding platform that helps students settle their university fee debt. Create a profile, share your story, and donors contribute towards your outstanding fees. Best for students who already owe fees and need community-driven support.",
  },
  {
    id: 2,
    logoKey: "Allan Gray Orbis Foundation",
    displayTitle: "Allan Gray Orbis Foundation",
    description:
      "A prestigious scholarship for future entrepreneurs and leaders. It offers full funding, mentorship, and leadership development. Ideal for high-achieving students with strong academics and entrepreneurial potential. Apply directly on the Allan Gray Orbis website during their annual intake.",
  },
  {
    id: 3,
    logoKey: "Dell Young Leaders",
    displayTitle: "Dell Young Leaders",
    description:
      "A scholarship that supports first-generation students from low-income households. It provides full financial aid, academic support, and career guidance. Students at partner universities are nominated or invited to apply after registration.",
  },
  {
    id: 4,
    logoKey: "Michael & Susan Dell Foundation",
    displayTitle: "Michael & Susan Dell Foundation",
    description:
      "Supports high-potential students with financial challenges through full bursaries and wrap-around support. Includes fees, accommodation, mentoring, and academic assistance. Applications are done through partner institutions and programs funded by the foundation.",
  },
  {
    id: 5,
    logoKey: "University of Pretoria",
    displayTitle: "University of Pretoria (UP Funding)",
    description:
      "UP offers various scholarships and bursaries based on academic merit and financial need. Students apply via the UP student portal. Useful for both new and returning students needing university-managed funding.",
  },
  {
    id: 6,
    logoKey: "University of Cape Town",
    displayTitle: "University of Cape Town (UCT Funding)",
    description:
      "UCT provides financial aid and merit scholarships through NSFAS and its internal funding office. Apply via the UCT Financial Aid Portal. Ideal for students with strong academic results or proven financial need.",
  },
  {
    id: 7,
    logoKey: "ISFAP",
    displayTitle: "ISFAP – Ikusasa Student Financial Aid Programme",
    description:
      "A full, structured bursary for students from poor and missing-middle households. Covers everything — fees, accommodation, meals, devices, and psychosocial support. Apply online during the ISFAP application window. Best for students studying in priority fields like engineering and health sciences.",
  },
  {
    id: 8,
    logoKey: "Sikelela Scholars",
    displayTitle: "Sikelela Scholars",
    description:
      "A scholarship for academically strong, motivated students from disadvantaged backgrounds. Offers tuition support, mentoring, and personal development. Apply on the Sikelela platform. Perfect for learners who show leadership and consistency.",
  },
  {
    id: 9,
    logoKey: "Mastercard Foundation",
    displayTitle: "Mastercard Foundation",
    description:
      "The Mastercard Foundation works with partners to provide education, employment, and financial inclusion for young people in Africa. Their scholarship and youth employment programmes support students and young professionals across the continent.",
  },
];

const logoMap: Record<string, string> = {
  "Feenix Trust": "/images/feelixlogo.png",
  "Allan Gray Orbis Foundation": "/images/allanlogo.png",
  "Dell Young Leaders": "/images/dellyounglogo.png",
  "Michael & Susan Dell Foundation": "/images/michealandsusanlogo.png",
  "University of Pretoria": "/images/uplogo.png",
  "University of Cape Town": "/images/uctlogo.png",
  "ISFAP": "/images/isfaplogo.png",
  "Sikelela Scholars": "/images/michealandsusanlogo.png",
  "Mastercard Foundation": "/images/mastercardfoundation.jpeg",
};

const Bursaries = () => {
  return (
    <section id="bursaries" className="py-14 sm:py-20 lg:py-28 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-xs sm:text-sm font-medium text-accent mb-2">Trusted by leading programmes</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Bursary <span className="text-gradient">Clients</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Bursary clients we work with to provide funded tutoring for their students.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {bursaries.map((bursary) => (
            <Card key={bursary.id} className="group card-hover relative overflow-hidden">
              <CardContent className="p-2 sm:pt-4">
                {/* Mobile: compact fixed-height logo area */}
                <div className="relative h-[72px] sm:hidden rounded border bg-background overflow-hidden">
                  <img
                    src={logoMap[bursary.logoKey] ?? "/placeholder.svg"}
                    alt={bursary.logoKey}
                    className="h-full w-full object-contain p-1.5"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-background/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-xs text-muted-foreground overflow-y-auto">
                    {bursary.description}
                  </div>
                </div>
                {/* Desktop: square aspect ratio */}
                <div className="hidden sm:block">
                  <AspectRatio ratio={1}>
                    <div className="relative h-full w-full">
                      <img
                        src={logoMap[bursary.logoKey] ?? "/placeholder.svg"}
                        alt={bursary.logoKey}
                        className="h-full w-full rounded-md object-contain bg-background border"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 rounded-md bg-background/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-sm text-muted-foreground overflow-y-auto">
                        {bursary.description}
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </CardContent>
              <CardHeader className="p-2 pt-0 sm:pt-1 sm:pb-4 sm:px-6">
                <CardTitle className="text-[10px] sm:text-sm text-center font-semibold leading-tight line-clamp-2 sm:line-clamp-none">
                  {bursary.displayTitle}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Section-level CTA - does not navigate */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center">
          <Button size="lg" variant="accent" type="button" className="h-10 px-6 sm:h-12 sm:px-8">
            Bursary Sign Up
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Bursaries;
