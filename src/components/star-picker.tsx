"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarPickerProps {
    value?: number;
    onChange?: (value: number) => void;
    disabled?: boolean;
    className?: string;
}

export const StarPicker = ({
    value = 0,
    onChange,
    disabled,
    className,
}: StarPickerProps) => {
    const [hoverValue, setHoverValue] = useState(0);

    const handleChange = (value: number) => {
        if (!disabled) {
            onChange?.(value);
        }
    };

    const handleMouseEnter = (star: number) => {
        if (!disabled) {
            setHoverValue(star);
        }
    };

    const handleMouseLeave = () => {
        if (!disabled) {
            setHoverValue(0);
        }
    };

    return (
        <div className={cn("flex items-center", disabled && "opacity-50", className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    className={cn(
                        "p-0.5 transition",
                        !disabled && "hover:scale-110 cursor-pointer",
                        disabled && "cursor-not-allowed"
                    )}
                    onClick={() => handleChange(star)}
                    onMouseEnter={() => handleMouseEnter(star)}
                    onMouseLeave={handleMouseLeave}
                >
                    <StarIcon
                        className={cn(
                            "size-5",
                            (hoverValue || value) >= star 
                                ? "text-yellow-600 fill-yellow-500" 
                                : "text-gray-300"
                        )}
                    />
                </button>
            ))}
        </div>
    );
};