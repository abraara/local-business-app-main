"use client";
import { CategoryDropDown } from "./category-dropdown";
import { CustomCategory } from "../types";
import { useRef, useState, useEffect, use } from "react";

interface Props {
    data: CustomCategory[]; // Updated to use CustomCategory type
};

export const Categories = ({ data }: Props) => {
const containerRef = useRef<HTMLDivElement>(null);
const measureRef = useRef<HTMLDivElement>(null);
const viewAllRef = useRef<HTMLDivElement>(null);

const [visibleCount, setVisibleCount] = useState(data.length);
const [isAnyHovered, setIsAnyHovered] = useState(false);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const activeCategory = "all";
const activeCategoryIndex = data.findIndex((category) => category.slug === activeCategory);
const isActiveCategoryHidden = activeCategoryIndex >= visibleCount;
const isActiveCategoryVisible = activeCategoryIndex < visibleCount;


useEffect(() => {
  const calculateVisible = () => {
    if (!containerRef.current || !measureRef.current || !viewAllRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const viewAllWidth = viewAllRef.current.offsetWidth;
    const availableWidth = containerWidth - viewAllWidth;

    const items = Array.from(containerRef.current.children);
    let totalWidth = 0;
    let visible = 0;

    for (const item of items) {
      const width = item.getBoundingClientRect().width;

      if (totalWidth + width > availableWidth) break;
      totalWidth += width;
      visible++;
    }
    setVisibleCount(visible);
  };
  const resizeObserver = new ResizeObserver(calculateVisible);
  resizeObserver.observe(containerRef.current!);

  return () => {
    resizeObserver.disconnect();
  };
}, [data.length]);


  return (
    <div className="relative w-full">

<div 
ref={measureRef}
className="absolute opacity-0 pointer-events-none flex"
style={{position: "fixed"}}
>
          {data.map((category) => (
            <div key={category.id}>
              <CategoryDropDown 
              category={category} 
              isActive={activeCategory === category.slug}
              isNavigationHovered={false}
              />
            </div>  
    ))}
    </div>

      <div className="flex flex-nowrap items-center">
          {data.map((category) => (
            <div key={category.id}>
              <CategoryDropDown 
              category={category} 
              isActive={activeCategory === category.slug}
              isNavigationHovered={false}
              />
            </div>  
    ))}
    </div>
    </div>
  );
};