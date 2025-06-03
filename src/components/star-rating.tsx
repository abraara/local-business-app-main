import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_RATING = 5;
const MIN_RATING = 0;

interface StarRatingProps {
    rating?: number;
    className?: string;
    iconClassName?: string;
    text?: string;
};

export const StarRating = ({
    rating, className, iconClassName, text,
}: StarRatingProps) => {
    const safeRating = Math.max(MIN_RATING, Math.min(rating ?? 0, MAX_RATING));
        return (
            <div className={cn("flex items-center", className)}>
            {Array.from({ length: MAX_RATING }).map((_, index) => (
                    <StarIcon
                        key={index}
                        className={cn(
                            "size-4",
                            index < safeRating ? "fill-amber-300 text-gray-300" : "text-gray-300",
                            iconClassName,
                        )}
                    />
            ))}
            {text && <p>{text}</p>}
            </div>
        )
};
