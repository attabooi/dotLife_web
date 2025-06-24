import { DateTime } from "luxon";
import type { Route } from "./+types/daily-leaderboards-page";
import { data, isRouteErrorResponse, Link } from "react-router";
import { z } from "zod";
import { HeroSection } from "~/common/components/hero-section";
import { ProductCard } from "../components/product-card";
import { Button } from "~/common/components/ui/button";
import ProductPagination from "~/common/components/product-pagination";

const paramsSchema = z.object({
  year: z.coerce.number(),
  month: z.coerce.number(),
  day: z.coerce.number(),
});


export const meta: Route.MetaFunction = ({ params }) => {
  const date = DateTime.fromObject(
    {
      year: Number(params.year),
      month: Number(params.month),
      day: Number(params.day),
    }
  ).setZone("Asia/Seoul").setLocale("ko");
  return [
    {
      title: `The best of ${date.toLocaleString(DateTime.DATE_MED)} | dotLife`,
    },
    {
      name: "description",
      content: "",
    },
  ];
};


export const loader = ({ params }: Route.LoaderArgs) => {
  const { success, data: parsedData } = paramsSchema.safeParse(params);

  if (!success) {
    throw data(
      {
        error_code: "INVALID_PARAMS",
        message: "Invalid params",
      },
      {
        status: 400,
      }
    );
  }
  const date = DateTime.fromObject(parsedData).setZone("Asia/Seoul");
  if (!date.isValid) {
    throw data(
      {
        error_code: "INVALID_DATE",
        message: "Invalid date",
      },
      {
        status: 400,
      }
    );
  }

  const today = DateTime.now().setZone("Asia/Seoul").startOf("day");
  if (date > today) {
    throw data(
      {
        error_code: "FUTURE_DATE",
        message: "Future date",
      },
      {
        status: 400,
      }
    );
  }

  return {
    ...parsedData,
  };
};

export default function DailyLeaderboardsPage({
  loaderData,
}: Route.ComponentProps) {
  const urlDate = DateTime.fromObject({
    year: loaderData.year,
    month: loaderData.month,
    day: loaderData.day,
  }).setZone("Asia/Seoul");

  const previousDay = urlDate.minus({ days: 1});
  const nextDay = urlDate.plus({ days: 1});
  const isToday = urlDate.equals(DateTime.now().startOf("day"));

  return (
    <div className="space-y-8">
      <HeroSection  
        title={`The best of ${urlDate.toLocaleString(DateTime.DATE_MED)}`}
        description="Check out the daily leaderboard to see who's the top performer today!"
      />

      <div className="flex justify-center gap-2">
        <Button variant="secondary" asChild>
          <Link to={`/products/leaderboards/daily/${previousDay.year}/${previousDay.month}/${previousDay.day}`}>
            &larr; {previousDay.toLocaleString(DateTime.DATE_SHORT)}
          </Link>
        </Button>
        {!isToday?         <Button variant="secondary" asChild>
          <Link to={`/products/leaderboards/daily/${nextDay.year}/${nextDay.month}/${nextDay.day}`}>
            {nextDay.toLocaleString(DateTime.DATE_SHORT)} &rarr;
          </Link>
        </Button> : null}

      </div>

      <div className="space-y-5 w-full max-w-screen-md mx-auto">
        {Array.from({ length: 11 }).map((_, index) => (
          <ProductCard
            key={`product-${index}`}
            id={`product-${index}`}
            name="Product Name"
            description="Product Description"
            commentsCount={12}
            viewsCount={12}
            votesCount={120}
          />
        ))}
      </div>
      <ProductPagination totalPages={10} currentPage={1} />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div className="container mx-auto px-4 py-8">
        {error.data.message} / {error.data.error_code}
      </div>
    );
  }
  if (error instanceof Error) {
    return <div className="container mx-auto px-4 py-8">{error.message}</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">Unknown error happened</div>
  );
}
