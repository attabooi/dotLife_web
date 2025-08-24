import { Link, type MetaFunction } from "react-router";
import { ProductCard } from "~/features/products/components/product-card";
import { Button } from "../components/ui/button";
import { PostCard } from "~/features/community/components/post-card";
import { IdeaCard } from "~/features/ideas/components/idea-card";
import { JobCard } from "~/features/jobs/components/job-card";
import { TeamCard } from "~/features/teams/components/team-card";
import { Particles } from "components/magicui/particles";
import { FlickeringGrid } from "components/magicui/flickering-grid";
import { GridPattern } from "components/magicui/grid-pattern";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | dotLife" },
    {
      name: "description",
      content: "The best products made by our community today.",
    },
  ];
};

export default function HomePage() {
  return (
    <>
      <div className="flex h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
          <span className="pointer-events-none whitespace-pre-wrap text-center text-7xl font-semibold leading-none">
            Visualize Your Discipline
          </span>
          <h1 className="pointer-events-none mt-4 text-xl text-muted-foreground text-center max-w-xl mx-auto">
          Complete Your Daily Quests. Build Your Tower.
          </h1>
          <p className="pointer-events-none mt-6 text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Build your daily habits into a tower! Every small habit you complete adds a block to your growing tower of discipline.
          </p>
          <div className="mt-6">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
              <Link to="/quests">
                Start Building
              </Link>
            </Button>
          </div>
        </div>
        <Particles
          className="absolute inset-0 z-0"
          quantity={200}
          size={2}
          ease={100}
          color={"#FFA81E"}
          refresh
        />
      </div>
      
      {/* <main className="relative px-20 space-y-40">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Today's Products
            </h2>
            <p className="text-xl font-light text-foreground mt-4">
              The Best products made by our community today.
            </p>
            <Button variant="link" asChild className="text-lg px-0">
              <Link to="/procuts/leaderboards">
                Explore all products &rarr;
              </Link>
            </Button>
          </div>
          {Array.from({ length: 11 }).map((_, index) => (
            <ProductCard
              key={`product-${index}`}
              productId={`product-${index}`}
              name="Product Name"
              description="Product Description"
              commentsCount={12}
              viewsCount={12}
              votesCount={120}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Latest Discussions
            </h2>
            <p className="text-xl font-light text-foreground mt-4">
              The latest discussions from our community.
            </p>
            <Button variant="link" asChild className="text-lg px-0">
              <Link to="/community">Explore all discussions &rarr;</Link>
            </Button>
          </div>
          {Array.from({ length: 11 }).map((_, index) => (
            <PostCard
              key={`post-${index}`}
              id={`post-${index}`}
              title="What is the best productivity app?"
              author="Nico"
              authorAvatarUrl="https://github.com/apple.png"
              category="Productivity"
              postedAt="12 hours ago"
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              IdeasGPT
            </h2>
            <p className="text-xl font-light text-foreground mt-4">
              Find the best ideas for your business.
            </p>
            <Button variant="link" asChild className="text-lg px-0">
              <Link to="/ideas">Explore all ideas &rarr;</Link>
            </Button>
          </div>
          {Array.from({ length: 11 }).map((_, index) => (
            <IdeaCard
              key={`idea-${index}`}
              id={`idea-${index}`}
              title="A startup that creates an AI-powered generated personal trainer, delivering customized fitness routines based on the user's goals and preferences using a mobile app to track workouts and progress."
              views={123}
              postedAt="12 hours ago"
              likesCount={12}
              claimed={index % 2 === 0}
            />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Latest Jobs
            </h2>
            <p className="text-xl font-light text-foreground mt-4">
              Find your dream job.
            </p>
            <Button variant="link" asChild className="text-lg px-0">
              <Link to="/jobs">Explore all jobs &rarr;</Link>
            </Button>
          </div>
          {Array.from({ length: 11 }).map((_, index) => (
            <JobCard
              key={`job-${index}`}
              id={`job-${index}`}
              company="Tesla"
              companyLogoUrl="https://github.com/facebook.png"
              companyHq="San Francisco, CA"
              title="Software Engineer"
              postedAt="12 hours ago"
              type="Full-time"
              positionLocation="Remote"
              salary="$100,000 - $120,000"
              applyUrl="/jobs/jobId"
            />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Find a team mate.
            </h2>
            <p className="text-xl font-light text-foreground mt-4">
              Join a team looking for a team mate.
            </p>
            <Button variant="link" asChild className="text-lg px-0">
              <Link to="/teams">Explore all teams &rarr;</Link>
            </Button>
          </div>
          {Array.from({ length: 11 }).map((_, index) => (
            <TeamCard
              key={`team-${index}`}
              id={`team-${index}`}
              leaderUsername="attabooi"
              leaderAvatarUrl="https://github.com/attabooi.png"
              positions={[
                "React Developer",
                "Backend Developer",
                "Product Manager",
              ]}
              description="a new product"
              joinUrl="/teams/teamId"
            />
          ))}
        </div>
      </main> */}
    </>
  );
}
