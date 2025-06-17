"use client"

import { useSuspenseQuery } from "@tanstack/react-query";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { useTRPC } from "@/trpc/client";
import { useParams } from "next/navigation";
import { DEFAULT_BG_COLOR } from "@/modules/home/constants";
import { BreadcrumbsNavigation } from "./breadcrumbs-navigation";
import { useProductFilters } from "@/modules/products/hooks/use-product-filters";

export const SearchFilters = () => {
  const trpc = useTRPC();
  const {data} = useSuspenseQuery(trpc.categories.getMany.queryOptions());
  const [filters, setFilters] = useProductFilters();
  const params = useParams();
  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all"; // Default to "all" if no category is specified

  const activeCategoryData = data.find((cat) => cat.slug === activeCategory);

  const activeCategoryColour = activeCategoryData?.color || DEFAULT_BG_COLOR // Default color if not found
  const activeCategoryName = activeCategoryData?.name || null

  const activeSubcategory = params.subcategory as string | undefined;
  const activeSubcategoryName = activeCategoryData?.subcategories?.find((sub) => sub.slug === activeSubcategory)?.name || null;

  return (
    <div className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full" style={{ backgroundColor: activeCategoryColour }}>
        <SearchInput defaultValue={filters.search} onChange={(value) => setFilters({ search: value })} />
        <div className="hidden lg:block">
          <Categories data={data} />
        </div>
        <BreadcrumbsNavigation 
          activeCategory={activeCategory} 
          activeCategoryName={activeCategoryName}
          activeSubcategoryName={activeSubcategoryName} 
        />
    </div>
  );
};

export const SearchFiltersLoading = () => {
  return (
    <div className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full" style={ { backgroundColor: "#f5f5f5" } }>
      <SearchInput disabled />
      <div className="hidden lg:block">
        <div className="h-11" />
      </div>
    </div>
  )
};