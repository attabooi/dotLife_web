import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/promote-page";
import { Form } from "react-router";
import SelectPair from "~/common/components/select-pair";
import { Calendar } from "~/common/components/ui/calendar";
import { Label } from "~/common/components/ui/label";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DateTime } from "luxon";
import { Button } from "~/common/components/ui/button";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Promote Product | dotLife" },
    {
      name: "description",
      content: "Promote your product to gain more visibility.",
    },
  ];
}

export default function PromotePage() {
  const [promotionPeriod, setPromotionPeriod] = useState<DateRange | undefined>(
    undefined
  );
  const totalDays =
    promotionPeriod?.from && promotionPeriod.to
      ? DateTime.fromJSDate(promotionPeriod.to).diff(
          DateTime.fromJSDate(promotionPeriod.from),
          "days"
        ).days
      : 0;
  return (
    <div>
      <HeroSection
        title="Promote Product"
        description="Promote your product to gain more visibility."
      />
      <Form className="max-w-sm mx-auto flex flex-col gap-4 items-center">
        <SelectPair
          label="Select a Product"
          name="product"
          required
          description="Select a product to promote."
          placeholder="Select a product"
          options={[
            {
              value: "ai-dark-mode-maker",
              label: "AI Dark Mode Maker",
            },
            {
              value: "ai-dark-mode-maker-1",
              label: "AI Dark Mode Maker-1",
            },
            {
              value: "ai-dark-mode-maker-2",
              label: "AI Dark Mode Maker-2",
            },
            {
              value: "ai-dark-mode-maker-3",
              label: "AI Dark Mode Maker-3",
            },
          ]}
        />
        <div className="flex flex-col gap-2 items-center w-full">
          <Label className="flex flex-col gap-1">
            Select a range of dates for promotion{""}
          </Label>
          <small className="text-muted-foreground">
            Minimum duration is 3 days.
          </small>
          <Calendar
            mode="range"
            selected={promotionPeriod}
            onSelect={setPromotionPeriod}
            min={3}
            disabled={{ before: new Date() }}
          />
        </div>
        <Button disabled={totalDays === 0}>
          Go to checkout (${totalDays * 20})
        </Button>
      </Form>
    </div>
  );
}
