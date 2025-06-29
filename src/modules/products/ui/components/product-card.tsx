import { generateTenantUrl } from "@/lib/utils";
import { LoaderIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";


interface ProductCardProps {
    id: string;
    name: string;
    imageUrl?: string | null;
    cover?: string | null;
    image2?: string | null;
    image3?: string | null;
    image4?: string | null;
    image5?: string | null;
    tenantSlug: string;
    tenantImageUrl?: string | null;
    reviewRating: number;
    reviewCount: number;
    price: number;
};

export const ProductCard = ({
    id,
    name,
    imageUrl,
    cover,
    //image2,
    //image3,
    //image4,
    //image5,
    tenantSlug,
    tenantImageUrl,
    reviewRating,
    reviewCount,
    price,
}: ProductCardProps) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    
    const primaryImage = cover || "/placeholder.jpg";
    const hoverImage = imageUrl || cover || "/placeholder.jpg";
    const handleUserClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(generateTenantUrl(tenantSlug));
    };
    return (
        <Link href={`${generateTenantUrl(tenantSlug)}/products/${id}`}>
            <div className="w-full bg-white shadow-md rounded-md duration-500 hover:scale-105 hover:shadow-xl overflow-hidden h-full flex flex-col"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative aspect-square overflow-hidden">
                    <Image
                        src={primaryImage}
                        alt={name}
                        fill
                        className={`object-cover absolute inset-0 transition-opacity duration-300 ${
                            isHovered && hoverImage !== primaryImage ? 'opacity-0' : 'opacity-100'
                        }`}
                    />
                    
                    {/* Hover Image - Only render if different from primary */}
                    {hoverImage !== primaryImage && (
                        <Image
                            src={hoverImage}
                            alt={`${name} - alternate view`}
                            fill
                            className={`object-cover absolute inset-0 transition-opacity duration-300 ${
                                isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    )}
                </div>
                <div className="p-4 border-y flex flex-col gap-3 flex-1">
                    <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
                    <div className="flex items-center gap-2 hover:underline" onClick={handleUserClick}>
                        {tenantImageUrl && (
                            <Image
                                src={tenantImageUrl}
                                alt={tenantSlug}
                                width={16}
                                height={16}
                                className="rounded-full border shrink-0 size-[16px]"
                            />
                        )}
                        <p className="text-sm font-medium">{tenantSlug}</p>
                    </div>
                    {reviewCount > 0 && (
                        <div className="flex items-center gap-1">
                            <StarIcon className="size-3.5 fill-black" />
                            <p className="text-sm font0medium">{reviewRating} ({reviewCount})</p>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="relative px-2 py-1 border bg-gray-200 w-fit">
                        <p className="text-sm font-medium">{formatCurrency(price)}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const ProductCardSkeleton = () => {
    return (
        <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse flex items-center justify-center p-4">
            <LoaderIcon className="size-4 animate-spin" />
        </div>
    )
};