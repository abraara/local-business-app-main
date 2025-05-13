"use client";
import { Category } from "@/payload-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRef } from "react";
import { useDropdownPosition } from "./use-dropdown-position";
import { SubCategoryMenu } from "./subcategory-menu";
import { get } from "http";

interface Props {
  category: Category;
    isActive?: boolean;
    isNavigationHovered: boolean;
};

export const CategoryDropDown = ({ category, isActive, isNavigationHovered }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getDropdownPosition} = useDropdownPosition(dropdownRef);

  const onMouseEnter = () => {
    if (category.subcategories) {
      setIsOpen(true);
    }
  };

  const onMouseLeave = () => {
    setIsOpen(false);
  };

  const dropdownPosition = getDropdownPosition();


  return (
    <div className="relative"
    ref={dropdownRef}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}>
      <div className="relative">
      <Button variant="outline"
    className={cn(
      "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black cursor-pointer hover:cursor-pointer",
      isActive && !isNavigationHovered && "bg-white border-primary"
    )}
    >
        {category.name}
    </Button>
    <SubCategoryMenu 
    category={category}
    isOpen={isOpen}
    position={dropdownPosition}
    />
    </div>
    </div>
  );
};