interface HeroSectionProps {
  title: string;
  description: string;
}

export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <div className="flex flex-col py-20 justify-center items-center rounded-md bg-gradient-to-t from-background to-primary/10 p-4">
      <h1 className="text-5xl font-bold">
        {title}
      </h1>
      <p className="text-2xl font-light text-foreground mt-4">
        {description}
      </p>
    </div>
  );
} 