import { cn, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CheckoutItemProps {
    isLast?: boolean;
    imageUrl?: string | null;
    name: string;
    productUrl: string;
    tenantUrl: string;
    tenantName: string;
    price: number;
    onRemove: () => void;
};

export const CheckoutItem = ({
    isLast,
    imageUrl,
    name,
    productUrl,
    tenantUrl,
    tenantName,
    price,
    onRemove,
}: CheckoutItemProps) => {
    return (
        <div className={cn("grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border-b", isLast && "border-b-0")}>
           <div className="overflow-hidden border-r">
            <div className="relative aspect-square h-full">
                <Image
                    src={imageUrl || "/placeholder.webp"}
                    alt={name}
                    fill
                    className="object-cover"
                />
            </div> 
           </div>
           <div className="py-4 flex flex-col justify-between">
            <div>
                <Link href={productUrl}>
                    <h4 className="font-medium hover:underline">
                            {name}
                    </h4>
                </Link>
                <p className="text-sm text-gray-500">
                    Sold by: <Link href={tenantUrl} className="font-medium hover:underline">{tenantName}</Link>
                </p>
                <p className="font-medium">{formatCurrency(price)}</p>

            </div>
           </div>
           <div className="flex items-end justify-end gap-2 py-4">
               <button
                   onClick={onRemove} className="font-medium hover:underline cursor-pointer"
               >
                   Remove
               </button>
           </div>
        </div>
    );
}
