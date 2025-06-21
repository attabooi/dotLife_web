import type { Route } from "./+types/submit-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Submit Product | dotLife" },
    {
      name: "description",
      content: "Submit your product to our community.",
    },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return {};
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function SubmitPage() {
  return (
    <main className="px-20 py-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        Submit
      </h1>
    </main>
  );
} 