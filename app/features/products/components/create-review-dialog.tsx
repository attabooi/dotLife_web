import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/common/components/ui/dialog";
import { Button } from "~/common/components/ui/button";
import { Form } from "react-router";
import InputPair from "~/common/components/input-pair";
import { Label } from "~/common/components/ui/label";
import { StarIcon } from "lucide-react";
import { useState } from "react";

export default function CreateReviewDialog() {
  const [rating, setRating] = useState<number>(0);
  const [hoverstar, setHoverstar] = useState<number>(0);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text=2xl">
          What do you think about this product?
        </DialogTitle>
        <DialogDescription>
          Share your thoughts with other users and help them make the right
          choice.
        </DialogDescription>
      </DialogHeader>
      <Form className="space-y-10">
        <Label className="flex flex-col gap-1">
          Rating
          <small className="text-muted-foreground">
            what would you rate this product?
          </small>
        </Label>
        <div className="flex gap-2 mt-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className="relative"
              onMouseEnter={() => setHoverstar(star)}
              onMouseLeave={() => setHoverstar(0)}
            >
              <StarIcon
                className="size-5 text-yellow-400"
                fill={
                  hoverstar >= star || rating >= star ? "currentColor" : "none"
                }
              />
              <input
                type="radio"
                name="rating"
                value="star"
                required
                className="opacity-0 h-px w-px absolute"
                onChange={() => setRating(star)}
              />
            </label>
          ))}
        </div>

        <InputPair
          textArea
          label="Review"
          placeholder="Tell us more about it"
          required
          description="Max 1000 characters"
        />
        <DialogFooter>
          <Button type="submit">Submit review</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  );
}
