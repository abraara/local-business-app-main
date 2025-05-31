"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRef } from "react";
import { useDropdownPosition } from "./use-dropdown-position";
import { SubCategoryMenu } from "./subcategory-menu";
import Link from "next/link";
import { CategoriesGetManyOutput } from "@/modules/categories/types";

interface Props {
  category: CategoriesGetManyOutput[1];
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

  const toggleDropdown = () => {
    if (category.subcategories?.length) {
      setIsOpen(!isOpen);
    }
  }

  return (
    <div className="relative"
    ref={dropdownRef}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={toggleDropdown}
    > 
      <div className="relative">
      <Button variant="elevated"
    className={cn(
      "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black cursor-pointer hover:cursor-pointer",
      isActive && !isNavigationHovered && "bg-white border-primary", 
      isOpen && "bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] -translate-x-[4px] -translate-y-[4px]"
    )}
    >
      <Link
      href={category.slug === "all" ? "/" : `/${category.slug}`}
      >
      {category.name}
      </Link>
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