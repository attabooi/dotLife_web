interface HeroSectionProps {
  title: string;
  description: string;
}

export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <div className="flex flex-col py-8 md:py-20 justify-center items-center rounded-md bg-gradient-to-t from-background to-primary/10 p-4">
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-center px-4">
        {title}
      </h1>
      <p className="text-lg md:text-xl lg:text-2xl font-light text-foreground mt-2 md:mt-4 text-center px-4 max-w-2xl">
        {description}
      </p>
    </div>
  );
} 