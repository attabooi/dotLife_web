import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/submit-page";

import { Label } from "~/common/components/ui/label";
import { Input } from "~/common/components/ui/input";
import { Form } from "react-router";
import InputPair from "~/common/components/input-pair";
import SelectPair from "~/common/components/select-pair";
import { useState } from "react";
import { Button } from "~/common/components/ui/button";

export const meta: Route.MetaFunction = ({}) => {
  return [
    { title: "Submit Product | dotLife" },
    {
      name: "description",
      content: "Submit your product to our community.",
    },
  ];
};

export default function SubmitPage(actionData: Route.ComponentProps) {
  const [icon, setIcon] = useState<string | null>(null);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setIcon(URL.createObjectURL(file));
    }
  };
  return (
    <div>
      <HeroSection
        title="Submit Product"
        description="Submit your product to our community."
      />
      <Form className="grid grid-cols-2 gap-10 max-w-screen-lg mx-auto">
        <div className="space-y-5">
          <InputPair
            label="Name"
            description="This is the name of the product."
            id="name"
            name="name"
            type="text"
            required
            placeholder="Product Name"
          />
          <InputPair
            label="Tagline"
            description="60 characters or less"
            id="tagline"
            name="tagline"
            type="text"
            required
            placeholder="A concise description of your product"
          />
          <InputPair
            label="URL"
            description="The URL of the product."
            id="url"
            name="url"
            required
            placeholder="https://example.com"
          />
          <InputPair
            label="Description"
            description="A detailed description of the product."
            id="description"
            name="description"
            required
            placeholder="A detailed description of the product."
            textArea
          />
          <SelectPair
            label="Category"
            description="The category of the product."
            name="category"
            required
            placeholder="Select a category"
            options={[
              { value: "ai", label: "AI" },
              { value: "health", label: "Health" },
              { value: "education", label: "Education" },
              { value: "finance", label: "Finance" },
              { value: "gaming", label: "Gaming" },
              { value: "other", label: "Other" },
            ]}
          />
          <Button type="submit" className="w-full" size="lg">
            Submit
          </Button>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="size-40 rounded-xl shadow-xl overflow-hidden">
            {icon ? (
              <img
                src={icon}
                alt="icon"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <Label className="flex flex-col items-start gap-1">
            Icon {""}
            <small className="text-muted-foreground">
              The icon of the product.
            </small>
          </Label>

          <Input
            type="file"
            className="w-1/2"
            onChange={onChange}
            required
            name="icon"
          />
          <div className="flex flex-col text-xs">
            <span className="text-muted-foreground text-sm">
              Recommended size: 128x128px
            </span>
            <span className="text-muted-foreground text-sm">
              Allowed formats: PNG, JPG, SVG
            </span>
            <span className="text-muted-foreground text-sm">
              Maximum size: 1MB
            </span>
          </div>
        </div>
      </Form>
    </div>
  );
}
