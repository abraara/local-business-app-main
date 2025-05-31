"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PriceFilter } from "./price-filter";
import { useProductFilters } from "../../hooks/use-product-filters";

interface ProductFiltersProps {
    title: string;
    className?: string;
    children?: React.ReactNode;
}

const ProductFilter = ({ title, className, children }: ProductFiltersProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

    return (
        <div className={cn("border-b p-4 flex flex-col gap-2", className)}>
            <div  onClick={() => setIsOpen((current) => !current)} className="flex items-center justify-between cursor-pointer"> 
                <p className="font-medium">{title}</p>
                <Icon className="size-5 text-gray-500" />
            </div>
           <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
};

export const ProductFilters = () => {  
    const [filters, setFilters] = useProductFilters();

    const onChange = (key: keyof typeof filters, value: unknown) => {
        setFilters({
            ...filters, [key]: value
        });
    };

    return (
        <div className="border rounded-md bg-white">
            <div className="p-4 border-b flex items-center justify-between">
                <p className="font-medium">Filters</p>
                <button className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => {}} type="button">Clear</button>
            </div>
            <ProductFilter title="Price">
                <PriceFilter 
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onMinPriceChange={(value) => onChange("minPrice", value)}
                onMaxPriceChange={(value) => onChange("maxPrice", value)}
                />
            </ProductFilter>
        </div>
    )
};